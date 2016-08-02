import vscode = require("vscode");
import cassandra = require("cassandra-driver");
import cqlCompletionItems = require("./cqlCompletionItems");

import { Keyspace, ColumnFamily, Column } from "./types/cqlTypes";

export function registerScanCommand(): vscode.Disposable {
    return vscode.commands.registerCommand("cql.scan", () => {
        let scanner = new CqlCassandraScanner();
        scanner.Scan()
            .then(() => console.log("Cassandra scan complete."));
        console.log("Cassandra scan started.");
    });
}

export function executeScan(): Thenable<any> {
    return new Promise((resolve) => {
        vscode.commands.executeCommand("cql.scan")
            .then(() => {resolve(); });
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

    private addCompletionKeyspace(keyspace: Keyspace) {
        if (cqlCompletionItems.completionKeyspaces.indexOf(keyspace.Name) > -1) {
            console.error(`Already found keyspace ${keyspace.Name}, will not add again.`);
            return;
        }

        cqlCompletionItems.scannedKeyspaces.push(keyspace);

        cqlCompletionItems.completionKeyspaces.push(keyspace.Name);

        let item = new vscode.CompletionItem(keyspace.Name);
        item.detail = `Keyspace: ${keyspace.Name}`;
        item.filterText = keyspace.Name;
        item.insertText = keyspace.Name;
        item.kind = vscode.CompletionItemKind.Module;

        console.log("Adding completion item for keyspace...", item);
        cqlCompletionItems.completionItemList.push(item);
    }

    private addColumnCompletionItem(column: Column) {
        let qualifiedColumnName = `${column.ColumnFamily.Keyspace.Name}.${column.ColumnFamily.Name}.${column.Name}`;
        if (cqlCompletionItems.completionColumns.indexOf(qualifiedColumnName) > -1) {
            console.error(`Already found column ${qualifiedColumnName}, will not add again.`);
            return;
        }

        cqlCompletionItems.scannedColumns.push(column);
        column.ColumnFamily.Columns.push(column)

        cqlCompletionItems.completionColumns.push(qualifiedColumnName);

        let item = new vscode.CompletionItem(column.Name);
        item.detail = `Column: ${column.Name} for column family ${column.ColumnFamily.Name} in keyspace ${column.ColumnFamily.Keyspace.Name}`;
        item.filterText = column.Name;
        item.insertText = column.Name;
        item.kind = vscode.CompletionItemKind.Field;

        cqlCompletionItems.completionItemList.push(item);
    }

    private addColumnFamilyCompletionItem(columnFamily: ColumnFamily) {
        if (cqlCompletionItems.completionColumnFamilies.indexOf(columnFamily.Name) > -1) {
            console.error(`Already found column family ${columnFamily.Name}, will not add again.`);
            return;
        }

        cqlCompletionItems.scannedTables.push(columnFamily);
        columnFamily.Keyspace.ColumnFamilies.push(columnFamily); //TODO: this is crazy... come back to this..

        cqlCompletionItems.completionColumnFamilies.push(columnFamily.Name);

        let item = new vscode.CompletionItem(columnFamily.Name);
        item.detail = `Column family ${columnFamily.Name} from keyspace "${columnFamily.Keyspace.Name}"`;
        item.filterText = columnFamily.Name;
        item.insertText = columnFamily.Name;
        item.kind = vscode.CompletionItemKind.Class;

        cqlCompletionItems.completionItemList.push(item);
    }

    private getKeyspaces(): Promise<Array<Keyspace>> {
        return new Promise((resolve, reject) => {
            let statement = `select keyspace_name from system.schema_keyspaces`;

            this.executeStatement(statement)
                .then((result) => {
                    resolve(result.rows.filter(row => row.keyspace_name.indexOf("system") !== 0).map(row => new Keyspace(row.keyspace_name)));
                })
                .catch(error => {
                    if(error.message && error.message.indexOf("unconfigured table") > -1)
                    {
                        statement = `select keyspace_name from system_schema.keyspaces`;
                        this.executeStatement(statement)
                        .then((result) => {
                            resolve(result.rows.filter(row => row.keyspace_name.indexOf("system") !== 0).map(row => new Keyspace(row.keyspace_name)));
                        })
                        .catch(err=>reject(err));
                    } else {
                        reject(error);
                    }
                });
        });
    }

    private getColumnFamilies(keyspaces: Array<Keyspace>): Promise<Array<ColumnFamily>> {
        return new Promise((resolve, reject) => {
            let keyspacePromises = keyspaces.map(keyspace => {
                return new Promise<Array<ColumnFamily>>((resolve, reject) => {
                    let statement = `select columnfamily_name from system.schema_columnfamilies where keyspace_name = '${keyspace.Name}'`;

                    this.executeStatement(statement)
                        .then(result => {
                            resolve(result.rows.map(row => new ColumnFamily(keyspace, row.columnfamily_name)));
                        })
                        .catch(error => {
                            if(error.message && error.message.indexOf('unconfigured') > -1) {
                                let statement = `select table_name from system_schema.tables where keyspace_name = '${keyspace.Name}'`;

                                this.executeStatement(statement)
                                    .then(result => {
                                        resolve(result.rows.map(row => new ColumnFamily(keyspace, row.table_name)));
                                    })
                                    .catch(err=>reject(err));
                            } else {
                                reject(error);
                            }
                        });
                });
            });

            let returnColumnFamilies = new Array<ColumnFamily>();
            Promise.all(keyspacePromises)
                .then(columnFamiliesSet => {
                    columnFamiliesSet.forEach(columnFamilySet => 
                        (columnFamilySet as any).forEach(columnFamily => 
                            returnColumnFamilies.push(columnFamily)));
                            
                    resolve(returnColumnFamilies);
                });
        });
    }

    private getColumns(columnFamilies: Array<ColumnFamily>): Promise<Array<Column>> {
        return new Promise((resolve, reject) => {
            let columnFamilyPromises = columnFamilies.map(columnFamily => {
                return new Promise<Array<Column>>((resolve, reject) => {
                    let statement = `select column_name, type from system.schema_columns where keyspace_name = '${columnFamily.Keyspace.Name}' and columnfamily_name = '${columnFamily.Name}'`;

                    this.executeStatement(statement)
                        .then(result => {
                            resolve(result.rows.map(row => new Column(columnFamily, row.column_name)));
                        })
                        .catch(error => {
                            if(error.message && error.message.indexOf('unconfigured') > -1) {
                                let statement = `select column_name, type from system_schema.columns where keyspace_name = '${columnFamily.Keyspace.Name}' and table_name = '${columnFamily.Name}'`;

                                this.executeStatement(statement)
                                    .then(result => {
                                        resolve(result.rows.map(row => new Column(columnFamily, row.column_name, row.type)));
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
                    let returnColumns = new Array<Column>();
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