import vscode = require('vscode');
import cassandra = require('cassandra-driver');

import cqlCompletionItems = require('./cqlCompletionItems');

export function registerScanCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.scan', ()=> {
        scanCassandra();
    });
}

function scanCassandra() {
    let cassandraAddress = vscode.workspace.getConfiguration('cql')['address'];
    let cassandraPort = vscode.workspace.getConfiguration('cql')['port'];
    
    let clientOptions = {
        contactPoints: [cassandraAddress],
        hosts: [cassandraAddress]
    };
    let client = new cassandra.Client(clientOptions);
   
    client.connect((connectError,result)=> {
        client.execute(`select * from system.schema_keyspaces;`, (executeError,result)=>{
            if(executeError) {
                console.error(`Error: ${executeError}`);
                vscode.window.showErrorMessage(`Could not find keyspaces: ${executeError}`);
            }
            else {
                result.rows.forEach((keyspace)=> {
                    if(keyspace.keyspace_name.indexOf('system') != 0) {
                        console.log(`Found keyspace: ${keyspace.keyspace_name}... attempting to add to completion item.`); 
                        addCompletionKeyspace(keyspace.keyspace_name);
                    }
                });
           }
        });
    });
}

function addCompletionKeyspaceColumnFamilies(keyspaceName: string) {
    let cassandraAddress = vscode.workspace.getConfiguration('cql')['address'];
    let cassandraPort = vscode.workspace.getConfiguration('cql')['port']; //TODO: Use this.
    
    let clientOptions = {
        contactPoints: [cassandraAddress],
        hosts: [cassandraAddress]
    };
    
    let client = new cassandra.Client(clientOptions); //genericize this
   
    client.connect((connectError,result)=> {
        if(connectError) {
            console.error(`Error: ${connectError}`);
            vscode.window.showErrorMessage(`Could not connect to find column families: ${connectError}`);
        } else {
            client.execute(`select * from system.schema_columnfamilies where keyspace_name = '${keyspaceName}';`, (executeError,result)=>{
                if(executeError) {
                    console.error(`Error: ${executeError}`);
                    vscode.window.showErrorMessage(`Could not connect to find column families: ${executeError}`);
                } else {
                    result.rows.forEach(columnFamily => {
                        console.log(`Attempting to add column family ${columnFamily.columnfamily_name}.`);
                        addColumnFamily(columnFamily);
                    });
                }
            });
        }
    });
}

function addColumnFamily(columnFamily: any) {
    if(cqlCompletionItems.completionColumnFamilies.indexOf(columnFamily) > -1) {
        console.error(`Already found keyspace ${columnFamily}, will not add again.`);
        return; 
    }
    
    cqlCompletionItems.completionColumnFamilies.push(columnFamily.columnfamily_name);
    
    let item = new vscode.CompletionItem(columnFamily.columnfamily_name);
    item.detail = `Column family ${columnFamily.columnfamily_name} from keyspace '${columnFamily.keyspace_name}'`;
    item.filterText = columnFamily.columnfamily_name;
    item.insertText = columnFamily.columnfamily_name;
    item.kind = vscode.CompletionItemKind.Class;
    
    cqlCompletionItems.completionItemList.push(item);

}

function addCompletionKeyspace(keyspaceName : string) {
    if(cqlCompletionItems.completionKeyspaces.indexOf(keyspaceName) > -1) {
        console.error(`Already found keyspace ${keyspaceName}, will not add again.`);
        return; 
    }
        
    cqlCompletionItems.completionKeyspaces.push(keyspaceName);
    
    let item = new vscode.CompletionItem(keyspaceName);
    item.detail = `Keyspace: ${keyspaceName}`;
    item.filterText = keyspaceName;
    item.insertText = keyspaceName;
    item.kind = vscode.CompletionItemKind.Module;
    
    console.log("Adding completion item for keyspace...", item);
    cqlCompletionItems.completionItemList.push(item);
    
    addCompletionKeyspaceColumnFamilies(keyspaceName);
}