import vscode = require('vscode');

export var completionItemList : vscode.CompletionItem[] = [];
export var completionFields : string[] = [];
export var completionTables : string[] = [];

export function registerCompletionItemProvider() : vscode.Disposable {
    return vscode.languages.registerCompletionItemProvider('cql', new cqlCompletionItemProvider());
}

export class cqlCompletionItemProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken) : Promise<vscode.CompletionItem[]> {
        return new Promise((resolve, reject) => {
            return resolve(completionItemList);
        });
    }
    
    resolveCompletionItem(item: vscode.CompletionItem, token: vscode.CancellationToken): vscode.CompletionItem {
        return item;
    }
    
    dispose() {
        completionItemList = null;
    }
}