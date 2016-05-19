// Because these objects are so small I will keep them in a single file. If they grow we can refactor.

export class Keyspace {
    Name: string;

    constructor(keyspaceName: string) {
        this.Name = keyspaceName;
    }
}

export class ColumnFamily {
    Name: string;
    Keyspace: Keyspace;

    constructor(keyspace: Keyspace, columnFamilyName: string) {
        this.Keyspace = keyspace;
        this.Name = columnFamilyName;
    }
}

export class Column {
    Name: string;
    ColumnFamily: ColumnFamily;

    constructor(columnFamily: ColumnFamily, columnName: string) {
        this.ColumnFamily = columnFamily;
        this.Name = columnName;
    }
}