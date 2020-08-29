import vscode = require('vscode');
import cassandra = require('cassandra-driver');
import resultDocProvider = require('./cqlResultDocumentProvider');
import * as uuid from 'uuid';
import * as util from 'util';

export let currentResults = {};
let outputChannel = vscode.window.createOutputChannel(`CQL Output`);

export function registerExecuteCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.execute', ()=> {
        var statement = "";
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            statement = vscode.window.activeTextEditor.document.getText();
        }
        else {
            var selection = vscode.window.activeTextEditor.selection;
            statement = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        }
        executeCqlStatement(statement);
        
    });
}

export function executeCqlStatement(statement: string) {
    console.log('Configuring cql statement execution.');
    const cassandraAddress = vscode.workspace.getConfiguration("cql")["address"];
    const cassandraPort = vscode.workspace.getConfiguration("cql")["port"];
    const cassandraConnectionOptions = vscode.workspace.getConfiguration("cql")["connection"];
    const cloudUsername = vscode.workspace.getConfiguration("cql")["username"];
    const cloudPassword = vscode.workspace.getConfiguration("cql")["password"];
    const secureConnectBundle = vscode.workspace.getConfiguration("cql")["secureConnectBundle"];

    let clientOptions:any;
    if (cloudUsername && cloudPassword && secureConnectBundle) {
        clientOptions = {
            cloud: { secureConnectBundle: secureConnectBundle},
            credentials: { username: cloudUsername, password: cloudPassword }
        }
    } else if (!!cassandraConnectionOptions) {
        clientOptions = cassandraConnectionOptions;
    } else {
        clientOptions = {
            contactPoints: [cassandraAddress],
            hosts: [cassandraAddress]
        };
    }
    console.log('Cassandra connection configuration', clientOptions);
    
    const client = new cassandra.Client(clientOptions);
    var statement = statement;
    console.log("statement: " + statement);
    outputChannel.show();
    outputChannel.appendLine(`Executing statement:"${statement}" against Cassandra @  + ${cassandraAddress}:${cassandraPort}`);

    client.connect((err, result) => {
        client.execute(statement.toString(), [], { prepare: true }, function (err, result) {
            console.log('executed', err, result);
            if(err) {
                currentResults = err;
                outputChannel.appendLine(`Error executing statement: ${util.inspect(err)}`)
            } else {
                currentResults = result;
                outputChannel.appendLine(`Execution successful.`)
            }

            showResults(err, result);
        });
    });
}

export function registerResultDocumentProvider() : vscode.Disposable {
    let provider = new resultDocProvider.cqlResultDocumentProvider();
    return vscode.workspace.registerTextDocumentContentProvider('cql-result', provider);
}

export function registerAll() : vscode.Disposable[] { //I like that.. I may keep this.
    return [registerExecuteCommand(), registerResultDocumentProvider()];
}

function showResults(error, results) {
    if(vscode.workspace.getConfiguration("cql")["resultStyle"].location == "output") {
        outputChannel.appendLine("Results:");
        outputChannel.appendLine(util.inspect(error ? error : currentResults, {depth: 64}));
        outputChannel.appendLine(new Date().toTimeString());
        outputChannel.show();
    } else {
        let resultUri = `cql-result://api/results${uuid.v4()}?error=${!!error}`;
        vscode.commands.executeCommand('vscode.previewHtml', resultUri, vscode.ViewColumn.Two, 'Cassandra Execution Results')
            .then((success) => {
                //do nothing it worked already...
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
    }
}