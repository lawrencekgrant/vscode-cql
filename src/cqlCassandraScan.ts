import vscode = require('vscode');
import cassandra = require('cassandra-driver');

export function scanCassandra() {
    let cassandraAddress = vscode.workspace.getConfiguration('cql')['address'];
    let cassandraPort = vscode.workspace.getConfiguration('cql')['port'];
    
    let clientOptions = {
        contactPoints: [cassandraAddress],
        hosts: [cassandraAddress]
    };
    let client = new cassandra.Client(clientOptions);
   
    client.connect((err,result)=> {
        client.execute(""select * from system.schema_keyspaces;"", (err,result)=>{
            console.log(result);
        });
        console.log(result);
    });
    
    
}