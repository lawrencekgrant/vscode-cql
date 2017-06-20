import { cqlItem } from './cqlItem';
import { keySpace, column } from './cqlItemTypes';

export class columnFamily extends cqlItem {
    Keyspace: keySpace;
    Columns: column[];

    constructor(keyspace: keySpace, columnFamilyName: string) {
        super(columnFamilyName);
        this.Keyspace = keyspace;
        this.Columns = [];
    }
}