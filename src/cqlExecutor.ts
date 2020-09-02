import vscode = require('vscode');
import cassandra = require('cassandra-driver');
import resultDocProvider = require('./cqlResultDocumentProvider');
import * as uuid from 'uuid';
import * as util from 'util';

export let currentResults = {};
let outputChannel = vscode.window.createOutputChannel(`CQL Output`);

export function registerExecuteCommand() : vscode.Disposable {
    return vscode.commands.registerCommand('cql.execute', () => {
        let query;
        if (vscode.window.activeTextEditor.selection.isEmpty) {
            query = vscode.window.activeTextEditor.document.getText();
        }
        else {
            var selection = vscode.window.activeTextEditor.selection;
            query = vscode.window.activeTextEditor.document.getText(new vscode.Range(selection.start, selection.end));
        }
        executeCqlQuery(query);
    });
}

export async function executeCqlQuery(query: string) {
    console.log('Configuring cql query execution.');
    const cassandraAddress = vscode.workspace.getConfiguration("cql")["address"];
    const cassandraPort = vscode.workspace.getConfiguration("cql")["port"];
    const cassandraConnectionOptions = vscode.workspace.getConfiguration("cql")["connection"];
    const cloudUsername = vscode.workspace.getConfiguration("cql")["username"];
    const cloudPassword = vscode.workspace.getConfiguration("cql")["password"];
    const secureConnectBundle = vscode.workspace.getConfiguration("cql")["secureConnectBundle"];

    let clientOptions;
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
    console.log("query: " + query);
    outputChannel.show();
    outputChannel.appendLine(`[QUERY] ${query}`);

    client.connect()
        .then(() => {
            return client.execute(query.toString(), [], {prepare: true})
        })
        .then((results) => {
            outputChannel.appendLine(JSON.stringify(results.rows, null, 2));
        })
        .catch(err => {
            outputChannel.appendLine(`Error executing query: ${util.inspect(err)}`)
        });
}

export function registerResultDocumentProvider() : vscode.Disposable {
    let provider = new resultDocProvider.cqlResultDocumentProvider();
    return vscode.workspace.registerTextDocumentContentProvider('cql-result', provider);
}

export function registerAll() : vscode.Disposable[] { //I like that.. I may keep this.
    return [registerExecuteCommand(), registerResultDocumentProvider()];
}
