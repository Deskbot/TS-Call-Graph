import * as ts from "typescript";

export enum PropertyType {
    Field,
    Method,
}

export class Property {
    constructor(
        public readonly name: string,
        public readonly modifiers: ts.ModifiersArray | undefined,
        public readonly propertyType: PropertyType
    ) {}
}
