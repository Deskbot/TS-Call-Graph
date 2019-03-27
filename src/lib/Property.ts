import * as ts from "typescript";

import { OneToManyMap } from "./OneToManyMap";

export type PropertyToMethodsMap = OneToManyMap<Property, Property>;

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

/**
 * Used to ensure that there are no 2 instances of the Property class for the same property
 */
export class PropertyFactory {
    private readonly propertiesMade: Map<string, Property>;

    constructor() {
        this.propertiesMade = new Map();
    }

    get(name: string): Maybe<Property> {
        return this.propertiesMade.get(name);
    }

    /**
     * Retrieve a previously made Property or a new Property with the given parameters,
     * if one doesn't already exist.
     *
     * @param name The Property's name
     * @param modifiers The Property's modifiers
     * @param propertyType The type of Property
     */
    make(name: string, modifiers: ts.ModifiersArray | undefined, propertyType: PropertyType): Property {
        if (this.propertiesMade.has(name)) {
            return this.propertiesMade.get(name)!;
        }

        const property = new Property(name, modifiers, propertyType);
        this.propertiesMade.set(name, property);
        return property;
    }
}
