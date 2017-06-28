import * as vscode from 'vscode';
import { cqlItem } from './types/cqlItem';
import { cqlItemTypes } from './types/cqlTypes';
import * as path from 'path';

export class cqlTreeItem extends vscode.TreeItem {
    public item: cqlItem;

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
        ) {
            super(label, collapsibleState);
        } 

    iconPath = {
        light: this.item ? this.getIconPathByCqlItemType(this.item.cqlItemType, 'light') : '',
        dark: this.item ? this.getIconPathByCqlItemType(this.item.cqlItemType, 'dark') : ''
    };

    contextValue = 'cqlItem';

    private getIconPathByCqlItemType (itemType: cqlItemTypes, themePath) {
        switch(itemType) {
            case cqlItemTypes.keyspace:
                return path.join('images', 'icons', themePath, 'keyspace.png');
            case cqlItemTypes.columnFamily:
                return path.join('images', 'icons', themePath, 'columnfamily.png');
            case cqlItemTypes.column:
                return path.join('images', 'icons', themePath, 'field.png');
            default:
                return '';
        }
    }
}