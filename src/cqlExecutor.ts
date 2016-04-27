import vscode = require('vscode');
//import cassandra = require('cassandra-driver');

export function registerExecuteCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.execute', ()=> {
        vscode.window.showInformationMessage("Configuring...");
        var cassandraConfig = vscode.workspace.getConfiguration("cql.configuration");
        console.log('cassandra config', cassandraConfig);
        var cassandraAddress = cassandraConfig.get("cassandra.address");
        //var cassandraAddress = vscode.workspace.getConfiguration("cassandra.address");
        var cassandraPort = vscode.workspace.getConfiguration("cassandra.port").get("");
        console.log('cassandra address', cassandraAddress);
        console.log('cassandra port', cassandraPort);
        vscode.window.showInformationMessage("Executing statement against Cassandra @ " + cassandraAddress);
        console.log('cassandra location', cassandraAddress);
        /*  var client = new cassandra.Client({
            contactPoints: [cassandraAddress],
            hosts: [cassandraAddress]
        });
        */
        vscode.workspace.getConfiguration("cassandra.cql");
        var statement = "";
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            statement = vscode.window.activeTextEditor.document.getText();
        }
        else {
            var selection = vscode.window.activeTextEditor.selection;
            statement = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        }
        console.log("statement: " + statement);
        /*
        client.connect(function (err, result) {
            client.execute(statement.toString(), [], { prepare: true }, function (err, result) {
                console.log('executed', err, result);
                var outputChannel = vscode.window.createOutputChannel("CQL Results");
                var resultText = "";
                outputChannel.clear();
                outputChannel.append(JSON.stringify(err ? err : result));
                outputChannel.show();
            });
        });*/
    });
}