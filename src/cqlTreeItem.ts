import * as vscode from 'vscode';
import { cqlItem } from './types/cqlItem';

export class cqlTreeItem extends vscode.TreeItem {
    public item: cqlItem;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
        ) {
            super(label, collapsibleState);
        } 

    /*
    //TODO: decide on how too implement this, resources should be shared.
    iconClass = {
        light: '',
        dark: ''
    };
    */
    
    contextValue = 'cqlItem';
}