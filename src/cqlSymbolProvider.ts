import vscode = require('vscode')
//TODO: Split this stuff into something that both completion items and symbols can reference.
import cqlCompletionItems = require('./cqlCompletionItems'); 

export function registerDocumentSymbolProvider() : vscode.Disposable {
    return vscode.languages.registerDocumentSymbolProvider('cql', new cqlDocumentSymbolProvider());
}

export class cqlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols (document : vscode.TextDocument, token : vscode.CancellationToken) : vscode.SymbolInformation [] {
        console.log("document symbols test", document);
        return null;
    }
}