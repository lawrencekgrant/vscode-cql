import { cqlItem } from './cqlItem';
import { columnFamily } from './columnFamily';
import { cqlItemTypes } from './cqlTypes';

export class column extends cqlItem {
    columnFamily: columnFamily;
    type: string

    constructor(columnFamily: columnFamily, columnName: string, typeName: string = '') {
        super(columnName);
        this.columnFamily = columnFamily;
        this.cqlItemType = cqlItemTypes.column;
        this.type = typeName;
    }
}