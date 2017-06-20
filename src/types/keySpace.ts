import { cqlItem } from './cqlItem';
import { columnFamily } from './cqlItemTypes';
import { cqlItemTypes } from './cqlTypes';

export class keySpace extends cqlItem {
    ColumnFamilies: columnFamily[];

    constructor(keyspaceName: string) {
        super(keyspaceName, cqlItemTypes.keyspace);
        this.name = keyspaceName;
        this.ColumnFamilies = [];
    }
}