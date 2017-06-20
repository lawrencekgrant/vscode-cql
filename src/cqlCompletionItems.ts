import vscode = require('vscode');
import cqlTypes = require('./types/cqlTypes');
import { keySpace } from './types/keySpace';
import { columnFamily } from './types/columnFamily';
import { column } from './types/column';

export var completionItemList: vscode.CompletionItem[] = [];
export var completionFields: string[] = [];
export var completionTables: string[] = [];
export var completionKeyspaces: string[] = [];
export var completionColumnFamilies: string [] = [];
export var completionColumns: string[] = [];

export var scannedKeyspaces: keySpace[] = [];
export var scannedTables: columnFamily[] = [];
export var scannedColumns: column[] = [];

export function registerCompletionItemProvider(): vscode.Disposable {
    return vscode.languages.registerCompletionItemProvider('cql', new CqlCompletionItemProvider());
}

export class CqlCompletionItemProvider implements vscode.CompletionItemProvider {
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