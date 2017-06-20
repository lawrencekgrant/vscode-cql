import * as vscode from 'vscode';
import { cqlItem } from './types/cqlItem';
import { cqlTreeItem } from './cqlTreeItem';
import { cqlItemTypes } from './types/cqlTypes';

export class CqlSchemaTreeDataProvider implements vscode.TreeDataProvider<cqlTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<cqlTreeItem | undefined> = new vscode.EventEmitter<cqlTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<cqlTreeItem | undefined> = this._onDidChangeTreeData.event;

    constructor(private workspaceRoot: string) {
    }

    refresh() : void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: cqlTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: cqlTreeItem): Thenable<cqlTreeItem[]> {
        if(!this.workspaceRoot) {
            vscode.window.showInformationMessage('No Cassandra data found.');
            return Promise.resolve([]);
        }

        return new Promise(resolve=> {
            if(element) {
                resolve(this.getDependentItems(element.item))
            } else {

            }
        })
    }

    private getDependentItems(cassandraItem: cqlItem): cqlItem[] {
        switch(cassandraItem.cqlItemType) {
            case cqlItemTypes.column:
                break;
            case cqlItemTypes.columnFamily:
                break;
            case cqlItemTypes.keyspace:
                break;
        }

        return new cqlItem[0];
    }
} 