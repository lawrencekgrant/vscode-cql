import vscode = require("vscode");
import cassandra = require("cassandra-driver");
import cqlCompletionItems = require("./cqlCompletionItems");

import { keySpace, columnFamily, column } from "./types/cqlItemTypes";

let afterScanComplete = null;

export function registerScanCommand(afterScanComplete?: Function): vscode.Disposable {
    return vscode.commands.registerCommand("cql.scan", () => {
        let scanner = new CqlCassandraScanner();
        scanner.Scan()
            .then(() =>{
                console.log("About to run post scan.");
                afterScanComplete();
                console.log("Cassandra scan complete.")
            });
        console.log("Cassandra scan started.");
    });
}

export function executeScan(): Thenable<any> {
    return new Promise((resolve) => {
        vscode.commands.executeCommand("cql.scan")
            .then(() => {
                resolve(); 
            });
    });
}

export class CqlCassandraScanner {
    private client;
    private isConnected: boolean;

    constructor() {
        this.client = this.getDefaultClient();
        this.client.connect((error, result) => {
            if (error)
                throw error;

            this.isConnected = true;
        });
    }

    private getDefaultClient() {
        console.log("getting default cassandra client.");
        let cassandraAddress = vscode.workspace.getConfiguration("cql")["address"];
        let cassandraPort = vscode.workspace.getConfiguration("cql")["port"];

        let cassandraConnectionOptions = vscode.workspace.getConfiguration("cql")["connection"];

        let clientOptions = !!cassandraConnectionOptions 
            ? cassandraConnectionOptions 
            : {
                contactPoints: [cassandraAddress],
                hosts: [cassandraAddress]
            };

        console.log("client options:", clientOptions);

        let client = new cassandra.Client(clientOptions);
        return client;
    }

    public Scan(): Promise<boolean> {
        return new Promise((resolve, reject) => {

            this.getKeyspaces()
                .then((keyspaces) => {
                    keyspaces.forEach(keyspace => this.addCompletionKeyspace(keyspace));
                    this.getColumnFamilies(keyspaces)
                        .then(columnFamilies => {
                            columnFamilies.forEach(columnFamiliy => this.addColumnFamilyCompletionItem(columnFamiliy));
                            this.getColumns(columnFamilies)
                                .then(columns => {
                                    columns.forEach(column => this.addColumnCompletionItem(column))
                                    resolve();
                                });
                        });
                })
                .catch((err) => reject(err));
        });
    }

    private addCompletionKeyspace(keyspace: keySpace) {
        if (cqlCompletionItems.completionKeyspaces.indexOf(keyspace.name) > -1) {
            console.error(`Already found keyspace ${keyspace.name}, will not add again.`);
            return;
        }

        cqlCompletionItems.scannedKeyspaces.push(keyspace);

        cqlCompletionItems.completionKeyspaces.push(keyspace.name);

        let item = new vscode.CompletionItem(keyspace.name);
        item.detail = `Keyspace: ${keyspace.name}`;
        item.filterText = keyspace.name;
        item.insertText = keyspace.name;
        item.kind = vscode.CompletionItemKind.Module;

        console.log("Adding completion item for keyspace...", item);
        cqlCompletionItems.completionItemList.push(item);
    }

    private addColumnCompletionItem(column: column) {
        let qualifiedColumnName = `${column.columnFamily.Keyspace.name}.${column.columnFamily.name}.${column.name}`;
        if (cqlCompletionItems.completionColumns.indexOf(qualifiedColumnName) > -1) {
            console.error(`Already found column ${qualifiedColumnName}, will not add again.`);
            return;
        }

        cqlCompletionItems.scannedColumns.push(column);
        column.columnFamily.Columns.push(column)

        cqlCompletionItems.completionColumns.push(qualifiedColumnName);

        let item = new vscode.CompletionItem(column.name);
        item.detail = `column: ${column.name} for column family ${column.columnFamily.name} in keyspace ${column.columnFamily.Keyspace.name}`;
        item.filterText = column.name;
        item.insertText = column.name;
        item.kind = vscode.CompletionItemKind.Field;

        cqlCompletionItems.completionItemList.push(item);
    }

    private addColumnFamilyCompletionItem(columnFamily: columnFamily) {
        if (cqlCompletionItems.completionColumnFamilies.indexOf(columnFamily.name) > -1) {
            console.error(`Already found column family ${columnFamily.name}, will not add again.`);
            return;
        }

        cqlCompletionItems.scannedTables.push(columnFamily);
        columnFamily.Keyspace.ColumnFamilies.push(columnFamily); //TODO: this is crazy... come back to this..

        cqlCompletionItems.completionColumnFamilies.push(columnFamily.name);

        let item = new vscode.CompletionItem(columnFamily.name);
        item.detail = `column family ${columnFamily.name} from keyspace "${columnFamily.Keyspace.name}"`;
        item.filterText = columnFamily.name;
        item.insertText = columnFamily.name;
        item.kind = vscode.CompletionItemKind.Class;

        cqlCompletionItems.completionItemList.push(item);
    }

    private getKeyspaces(): Promise<Array<keySpace>> {
        return new Promise((resolve, reject) => {
            let statement = `select keyspace_name from system.schema_keyspaces`;

            this.executeStatement(statement)
                .then((result) => {
                    resolve(result.rows.filter(row => row.keyspace_name.indexOf("system") !== 0).map(row => new keySpace(row.keyspace_name)));
                })
                .catch(error => {
                    if(error.message && error.message.indexOf("unconfigured table") > -1)
                    {
                        statement = `select keyspace_name from system_schema.keyspaces`;
                        this.executeStatement(statement)
                        .then((result) => {
                            resolve(result.rows.filter(row => row.keyspace_name.indexOf("system") !== 0).map(row => new keySpace(row.keyspace_name)));
                        })
                        .catch(err=>reject(err));
                    } else {
                        reject(error);
                    }
                });
        });
    }

    private getColumnFamilies(keyspaces: Array<keySpace>): Promise<Array<columnFamily>> {
        return new Promise((resolve, reject) => {
            let keyspacePromises = keyspaces.map(keyspace => {
                return new Promise<Array<columnFamily>>((resolve, reject) => {
                    let statement = `select columnfamily_name from system.schema_columnfamilies where keyspace_name = '${keyspace.name}'`;

                    this.executeStatement(statement)
                        .then(result => {
                            resolve(result.rows.map(row => new columnFamily(keyspace, row.columnfamily_name)));
                        })
                        .catch(error => {
                            if(error.message && error.message.indexOf('unconfigured') > -1) {
                                let statement = `select table_name from system_schema.tables where keyspace_name = '${keyspace.name}'`;

                                this.executeStatement(statement)
                                    .then(result => {
                                        resolve(result.rows.map(row => new columnFamily(keyspace, row.table_name)));
                                    })
                                    .catch(err=>reject(err));
                            } else {
                                reject(error);
                            }
                        });
                });
            });

            let returnColumnFamilies = new Array<columnFamily>();
            Promise.all(keyspacePromises)
                .then(columnFamiliesSet => {
                    columnFamiliesSet.forEach(columnFamilySet => 
                        (columnFamilySet as any).forEach(columnFamily => 
                            returnColumnFamilies.push(columnFamily)));
                            
                    resolve(returnColumnFamilies);
                });
        });
    }

    private getColumns(columnFamilies: Array<columnFamily>): Promise<Array<column>> {
        return new Promise((resolve, reject) => {
            let columnFamilyPromises = columnFamilies.map(columnFamily => {
                return new Promise<Array<column>>((resolve, reject) => {
                    let statement = `select column_name, type from system.schema_columns where keyspace_name = '${columnFamily.Keyspace.name}' and columnfamily_name = '${columnFamily.name}'`;

                    this.executeStatement(statement)
                        .then(result => {
                            resolve(result.rows.map(row => new column(columnFamily, row.column_name)));
                        })
                        .catch(error => {
                            if(error.message && error.message.indexOf('unconfigured') > -1) {
                                let statement = `select column_name, type from system_schema.columns where keyspace_name = '${columnFamily.Keyspace.name}' and table_name = '${columnFamily.name}'`;

                                this.executeStatement(statement)
                                    .then(result => {
                                        resolve(result.rows.map(row => new column(columnFamily, row.column_name, row.type)));
                                    })
                                    .catch(err => reject(err));
                            } else {
                                reject(error)
                            }
                        });
                });
            });

            Promise.all(columnFamilyPromises)
                .then(resultColumnSets => {
                    let returnColumns = new Array<column>();
                    resultColumnSets.forEach(columnSet => 
                        (columnSet as any).forEach(column => 
                            returnColumns.push(column)));
                    resolve(returnColumns);
                });
        });
    }

    private executeStatement(statement: string): Promise<any> { // TODO: a cassandra result, get from typings
        return new Promise((resolve, reject) => {
            console.log(`executing statement: ${statement}`);
            this.client.execute(statement, (error, result) => {
                if (error) {
                    console.error("Error executing statement:", error);
                    reject(error);
                } else {
                    console.log("query result:", result);
                    resolve(result);
                }
            });
        });
    }
}