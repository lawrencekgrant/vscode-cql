import * as vscode from 'vscode';
import { cqlItem } from './types/cqlItem';
import { cqlTreeItem } from './cqlTreeItem';
import { cqlItemTypes } from './types/cqlTypes';
import { scannedKeyspaces, scannedColumnFamilies, scannedColumns } from './cqlCompletionItems';

export class CqlSchemaTreeDataProvider implements vscode.TreeDataProvider<cqlTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<cqlTreeItem | undefined> = new vscode.EventEmitter<cqlTreeItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<cqlTreeItem | undefined> = this._onDidChangeTreeData.event;
    
    constructor(private context: vscode.ExtensionContext) {
        this.getChildren(undefined)
            .then(()=>{ this.refresh()});
    }

    refresh() : void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: cqlTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: cqlTreeItem): Thenable<cqlTreeItem[]> {
        if(!scannedKeyspaces) {
            return Promise.resolve([]);
        }

        return new Promise(resolve=> {
            if(element) {
                resolve(this.getDependentItems(element.item))
            } else {
                let keyspaceItems = new Array<cqlTreeItem>();
                scannedKeyspaces.forEach(itm=> {
                    let newTreeItem = new cqlTreeItem(itm.name, vscode.TreeItemCollapsibleState.Collapsed, null, itm);
                    keyspaceItems.push(newTreeItem);
                });
                resolve(keyspaceItems);
            }
        });
    }

    private getDependentItems(cassandraItem: cqlItem, context?: vscode.ExtensionContext): cqlItem[] {
        let returnItems = [];

        switch(cassandraItem.cqlItemType) {
            case cqlItemTypes.column:
                break;
            case cqlItemTypes.columnFamily:
                scannedColumns.forEach((col)=>{
                    if(col.columnFamily.name === cassandraItem.name) {
                        let newTreeItem = new cqlTreeItem(col.name, vscode.TreeItemCollapsibleState.None, null, col);
                        returnItems.push(newTreeItem);
                    }
                });
                break;
            case cqlItemTypes.keyspace:
                scannedColumnFamilies.forEach((itm)=> {
                    if(itm.Keyspace.name === cassandraItem.name) {
                        let newTreeItem = new cqlTreeItem(itm.name, vscode.TreeItemCollapsibleState.Collapsed, null, itm);
                        returnItems.push(newTreeItem);
                    }
                });
                break;
        }
        
        return returnItems;
    }
} 