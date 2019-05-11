import * as ts from "typescript";

export type Privacy = ts.ModifierFlags.Public | ts.ModifierFlags.Private | ts.ModifierFlags.Protected;

export enum PropertyType {
    Field,
    Method,
}

export class Property {
    constructor(
        public readonly name: string,
        public readonly modifiers: ts.ModifierFlags,
        public readonly propertyType: PropertyType,
        public readonly declaration: ts.Node
    ) {}

    private _privacy: Privacy | undefined;

    get privacy(): Privacy {
        if (this._privacy === undefined) {
            this._privacy = this.modifiers
                & (ts.ModifierFlags.Public | ts.ModifierFlags.Private | ts.ModifierFlags.Protected)
        }

        return this._privacy;
    }
}
