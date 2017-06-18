// Because these objects are so small I will keep them in a single file. If they grow we can refactor.

export class Keyspace {
    Name: string;
    ColumnFamilies: ColumnFamily[];

    constructor(keyspaceName: string) {
        this.Name = keyspaceName;
        this.ColumnFamilies = [];
    }
}

export class ColumnFamily {
    Name: string;
    Keyspace: Keyspace;
    Columns: Column[];

    constructor(keyspace: Keyspace, columnFamilyName: string) {
        this.Keyspace = keyspace;
        this.Name = columnFamilyName;
        this.Columns = [];
    }
}

export class Column {
    Name: string;
    ColumnFamily: ColumnFamily;
    Type: string

    constructor(columnFamily: ColumnFamily, columnName: string, typeName: string = '') {
        this.ColumnFamily = columnFamily;
        this.Name = columnName;
        this.Type = typeName;
    }
}