import { cqlItem } from './cqlItem';
import { keySpace } from './keySpace';
import { column } from './column';

export class columnFamily extends cqlItem {
    Keyspace: keySpace;
    Columns: column[];

    constructor(keyspace: keySpace, columnFamilyName: string) {
        super(columnFamilyName);
        this.Keyspace = keyspace;
        this.Columns = [];
    }
}