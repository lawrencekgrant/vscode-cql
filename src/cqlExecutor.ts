import vscode = require('vscode');
import cassandra = require('cassandra-driver');

export function registerExecuteCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.execute', ()=> {
        
        console.log('Configuring cql statement execution.');
        
        let cassandraAddress = vscode.workspace.getConfiguration("cql")["address"];
        let cassandraPort = vscode.workspace.getConfiguration("cql")["port"];

        let cassandraConnectionOptions = vscode.workspace.getConfiguration("cql")["connection"];

        let clientOptions = !!cassandraConnectionOptions 
            ? cassandraConnectionOptions 
            : {
                contactPoints: [cassandraAddress],
                hosts: [cassandraAddress]
            };
        
        console.log('Cassandra connection configuration', clientOptions);
        
        let client = new cassandra.Client(clientOptions);
        
        var statement = "";
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            statement = vscode.window.activeTextEditor.document.getText();
        }
        else {
            var selection = vscode.window.activeTextEditor.selection;
            statement = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        }
        console.log("statement: " + statement);
        vscode.window.showInformationMessage(`Executing statement:"${statement}" against Cassandra @  + ${cassandraAddress}:${cassandraPort}`);

        client.connect(function (err, result) {
            client.execute(statement.toString(), [], { prepare: true }, function (err, result) {
                console.log('executed', err, result);
                let outputChannel = vscode.window.createOutputChannel(`CQL Results [${cassandraAddress}:${cassandraPort}]`);
                outputChannel.clear();
                outputChannel.appendLine("Results:");
                outputChannel.appendLine(JSON.stringify(err ? err : result.rows));
                outputChannel.show();
            });
        });
    });
}