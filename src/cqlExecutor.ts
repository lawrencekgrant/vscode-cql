import vscode = require('vscode');
import cassandra = require('cassandra-driver');

export function registerExecuteCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.execute', ()=> {
        
        console.log('Configuring cql statement execution.');
        
        let cassandraAddress = vscode.workspace.getConfiguration("cql")["address"];
        let cassandraPort = vscode.workspace.getConfiguration("cql")["port"];
        
        console.log("address", cassandraAddress, "port", cassandraPort);
        
        vscode.window.showInformationMessage(`Executing statement against Cassandra @  + ${cassandraAddress}:${cassandraPort}`);
        console.log('cassandra location', cassandraAddress);
        
        let client = new cassandra.Client({
            contactPoints: [cassandraAddress],
            hosts: [cassandraAddress]
        });
        
        var statement = "";
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            statement = vscode.window.activeTextEditor.document.getText();
        }
        else {
            var selection = vscode.window.activeTextEditor.selection;
            statement = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        }
        console.log("statement: " + statement);

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