import { cqlItemTypes } from './cqlTypes';

export class cqlItem {
    name: string;
    cqlItemType: cqlItemTypes;

    constructor(name: string, cqlItemType: cqlItemTypes = cqlItemTypes.unknown) {
        this.name = name;
        this.cqlItemType = cqlItemType;
    }
}