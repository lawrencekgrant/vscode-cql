import vscode = require('vscode');
import cassandra = require('cassandra-driver');

import cqlCompletionItems = require('./cqlCompletionItems');

export function registerScanCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.scan', ()=> {
        scanCassandra();
    });
}

export function scanCassandra() {
    let cassandraAddress = vscode.workspace.getConfiguration('cql')['address'];
    let cassandraPort = vscode.workspace.getConfiguration('cql')['port'];
    
    let clientOptions = {
        contactPoints: [cassandraAddress],
        hosts: [cassandraAddress]
    };
    let client = new cassandra.Client(clientOptions);
   
    client.connect((err,result)=> {
        client.execute(`select * from system.schema_keyspaces;`, (err,result)=>{
            if(err)
                console.error(`Error: ${err}`);
            else
                result.rows.forEach((keyspace)=> {
                    if(keyspace.keyspace_name.indexOf('system') != 0) {
                        console.log(`Found keyspace: ${keyspace.keyspace_name}... attempting to add to completion item.`); 
                        addCompletionKeyspace(keyspace.keyspace_name);
                    }
                });
        });
    });
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
}