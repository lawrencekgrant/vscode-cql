// Because these objects are so small I will keep them in a single file. If they grow we can refactor.
export const enum cqlItemTypes {
    keyspace = 1,
    columnFamily = 2,
    column = 3,
    unknown = 4
}

export const enum cqlDataTypes {
    unknown = 0,
    ascii = 1,
    bigint = 2,
    blob = 3,
    boolean = 4,
    counter = 5,
    decimal = 6,
    double = 7,
    float = 8,
    frozen = 9,
    inet = 10,
    int = 11,
    list = 12,
    map = 13,
    set = 14,
    text = 15,
    timestamp = 16,
    timeuuid = 17,
    tuple = 18,
    uuid = 19,
    varchar = 20,
    varint = 21
}