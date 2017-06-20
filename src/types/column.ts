import { cqlItem } from './cqlItem';
import { columnFamily } from './columnFamily';

export class column extends cqlItem {
    columnFamily: columnFamily;
    type: string

    constructor(columnFamily: columnFamily, columnName: string, typeName: string = '') {
        super(columnName);
        this.columnFamily = columnFamily;
        this.type = typeName;
    }
}