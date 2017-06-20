import vscode = require("vscode");
import cqlSchemaDocumentProvider = require('./cqlSchemaDocumentProvider');
import * as uuid from 'uuid';
let previewUri = vscode.Uri.parse('cql-schema://');

export function registerSchemaCommand(): Array<vscode.Disposable> {
    const getViewColumn = (): vscode.ViewColumn => {
        return (!vscode.window.activeTextEditor) 
            ? vscode.ViewColumn.One
            : vscode.ViewColumn.Two
        }
    

    let executeRegistration = vscode.commands.registerCommand("cql.schema", () => {
        vscode.commands.executeCommand('vscode.previewHtml', previewUri + uuid.v4().toString(), getViewColumn(), 'Cassandra Schema')
            .then((success) => {
                //do nothing it worked already...
            }, (reason) => {
                vscode.window.showErrorMessage(reason);
            });
    });

    let provider = new cqlSchemaDocumentProvider.cqlSchemaDocumentProvider();
    let resultDocumentRegistration = vscode.workspace.registerTextDocumentContentProvider('cql-schema', provider);

    return [executeRegistration, resultDocumentRegistration];
}