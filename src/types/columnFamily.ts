import { cqlItem } from './cqlItem';
import { cqlItemTypes } from './cqlTypes';
import { keySpace, column } from './cqlItemTypes';

export class columnFamily extends cqlItem {
    Keyspace: keySpace;
    Columns: column[];

    constructor(keyspace: keySpace, columnFamilyName: string) {
        super(columnFamilyName);
        this.Keyspace = keyspace;
        this.cqlItemType = cqlItemTypes.columnFamily;
        this.Columns = [];
    }

    public GetSelectAllStatement() {
        return `select * from ${this.Keyspace.name}.${this.name} limit 200`;
    }
}