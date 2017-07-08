import * as vscode from 'vscode';
import { cqlItem } from './types/cqlItem';
import { cqlItemTypes } from './types/cqlTypes';
import * as path from 'path';

export class cqlTreeItem extends vscode.TreeItem {

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command,
        public readonly item?: cqlItem,
        public readonly context?: string
        ) {
            super(label, collapsibleState);
        } 

    iconPath = {
        light: this.getIconPathByCqlItemType(this.item.cqlItemType, 'light'),
        dark: this.getIconPathByCqlItemType(this.item.cqlItemType, 'dark')
    };

    contextValue = this.getContextValue(this.item);

    private getIconPathByCqlItemType (itemType: cqlItemTypes, themePath) {
        let returnPath = ''
        switch(itemType) {
            case cqlItemTypes.keyspace:
                returnPath = path.join(__filename, '..', '..', '..', 'images', 'icons', themePath, 'keyspace.png');
                break;
            case cqlItemTypes.columnFamily:
                returnPath = path.join(__filename, '..', '..', '..', 'images', 'icons', themePath, 'columnfamily.png');
                break;
            case cqlItemTypes.column:
                returnPath = path.join(__filename, '..', '..', '..', 'images', 'icons', themePath, 'field.png');
                break;
            default:
                returnPath = path.join(__filename, '..', '..', '..','images', 'icons', themePath, 'field.png');
                break;
        }

        return returnPath;
    }

    private getContextValue(item? : cqlItem) {
        if(!item) return 'cqlItem';

        switch(item.cqlItemType) {
            case cqlItemTypes.column:
                return 'column';
            case cqlItemTypes.columnFamily:
                return 'columnFamily';
            case cqlItemTypes.keyspace:
                return 'keyspace';
            default:
                return 'cqlItem';
        }
    }
}