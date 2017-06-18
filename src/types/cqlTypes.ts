// Because these objects are so small I will keep them in a single file. If they grow we can refactor.
import { cqlType } from './cqlType';

export class Keyspace extends cqlType {
    ColumnFamilies: ColumnFamily[];

    constructor(keyspaceName: string) {
        super(keyspaceName)
        this.Name = keyspaceName;
        this.ColumnFamilies = [];
    }
}

export class ColumnFamily extends cqlType {
    Keyspace: Keyspace;
    Columns: Column[];

    constructor(keyspace: Keyspace, columnFamilyName: string) {
        super(columnFamilyName);
        this.Keyspace = keyspace;
        this.Columns = [];
    }
}

export class Column extends cqlType {
    ColumnFamily: ColumnFamily;
    Type: string

    constructor(columnFamily: ColumnFamily, columnName: string, typeName: string = '') {
        super(columnName);
        this.ColumnFamily = columnFamily;
        this.Type = typeName;
    }
}