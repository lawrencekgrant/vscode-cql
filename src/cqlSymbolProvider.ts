import vscode = require('vscode')
//TODO: Split this stuff into something that both completion items and symbols can reference.
import cqlCompletionItems = require('./cqlCompletionItems'); 

export var DocumentSymbols : vscode.SymbolInformation [] = [];
export var WorkspaceSymbols : vscode.SymbolInformation [] = [];

export function registerWorkspaceSymbolProvider() : vscode.Disposable {
    return vscode.languages.registerWorkspaceSymbolProvider(new cqlWorkspaceSymbolProvider());
}

export function registerDocumentSymbolProvider() : vscode.Disposable {
    return vscode.languages.registerDocumentSymbolProvider("cql", new cqlDocumentSymbolProvider());
}

export class cqlWorkspaceSymbolProvider implements vscode.WorkspaceSymbolProvider {
    provideWorkspaceSymbols (query : string, token : vscode.CancellationToken) : vscode.SymbolInformation [] {
        console.log("Doc symbols:", WorkspaceSymbols);
        return WorkspaceSymbols;
    }
}


export class cqlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    provideDocumentSymbols (document : vscode.TextDocument, token : vscode.CancellationToken) : vscode.SymbolInformation [] {
        console.log("Doc symbols:", DocumentSymbols);
        return DocumentSymbols;
    }
}