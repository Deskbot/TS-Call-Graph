import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";
import {
    ClassDeclaration,
    ConstructorDeclaration,
    FunctionLikeDeclaration,
    Node as TsNode,
    PropertyDeclaration,
    SourceFile } from "typescript";

import { OneToManyMap } from "./lib/OneToManyMap";
import { depthFirstSearch } from "./lib/traversal";
import { boolify } from "./lib/function";

type ClassFeatures = {
    constructor: Maybe<ConstructorDeclaration>,
    methods: FunctionLikeDeclaration[],
    properties: PropertyDeclaration[],
};
type Maybe<T> = T | undefined;
type PropertyToMethodsMap = OneToManyMap<Property, Property>;

main();

function main() {
    let args: string[];
    let targetFilePath: string;
    let targetClass: string;

    try {
        args = process.argv.slice(2); // drop "node" and the file name
        targetFilePath = process.cwd() + "/" + args[0];
        targetClass = args[1];
    } catch (ignore) {
        throw new MyError("Usage: arg1: target file path, arg2: target class name");
    }

    const declarationExtractor = new ClassDeclarationExtractor(targetFilePath, targetClass);
    const map = declarationExtractor.createPropertyUsageMap();

    console.log(map);

    // build a d3 config object
}

class ClassDeclarationExtractor {
    private propertyFactory: PropertyFactory;
    private targetClass: string;
    private targetFilePath: string;

    constructor(targetFilePath: string, targetClass: string) {
        this.propertyFactory = new PropertyFactory();
        this.targetClass = targetClass;
        this.targetFilePath = targetFilePath
    }

    createPropertyUsageMap(): PropertyToMethodsMap {
        const parsedFile = this.parseFile(this.targetFilePath);
        const targetClassNode = this.extractClassDeclaration(parsedFile, this.targetClass);

        if (targetClassNode === undefined) {
            throw new MyError(`Target class declaration (${this.targetClass}) could not be found.`);
        }

        const featuresOfTargetClass = this.getClassFeatures(targetClassNode);

        const map = this.buildMapOfUsedProperties(featuresOfTargetClass);

        // want to include all properties on the eventual graph even if nothing maps to them
        for (const property of featuresOfTargetClass.properties) {
            map.setKey(this.propertyFactory.make(property.name.getText(), property.modifiers, PropertyType.Field));
        }

        return map;
    }

    private buildMapOfUsedProperties(classFeatures: ClassFeatures): PropertyToMethodsMap {
        const { constructor, methods } = classFeatures;

        const map = new OneToManyMap<Property, Property>();

        if (constructor) {
            const constr = this.propertyFactory.make("constructor", constructor.modifiers, PropertyType.Method);
            for (const property of this.getUsedProperties(constructor)) {
                map.set(constr, property);
            }
        }

        for (const method of methods) {
            let methodName = method.name ? method.name!.getText() : `anonymous method ${Math.random()}`; // not sure when this can happen

            for (const property of this.getUsedProperties(method)) {
                map.set(property, this.propertyFactory.make(methodName, method.modifiers, PropertyType.Method));
            }
        }

        return map;
    }

    private extractClassDeclaration(file: SourceFile, className: string): Maybe<ClassDeclaration> {
        return file.statements
            .filter(boolify)
            .filter(ts.isClassDeclaration)
            .find((classDec) => classDec.name !== undefined && classDec.name.text === className);
    }

    private getClassFeatures(cls: ClassDeclaration): ClassFeatures {
        const features: ClassFeatures = {
            constructor: undefined,
            properties: [],
            methods: [],
        };

        for (const feature of cls.members) {
            if (ts.isConstructorDeclaration(feature)) {
                features.constructor = feature;

            } else if (ts.isMethodDeclaration(feature)
                || ts.isGetAccessorDeclaration(feature)
                || ts.isSetAccessorDeclaration(feature)
            ) {
                features.methods.push(feature);

            } else if (ts.isPropertyDeclaration(feature)) {
                features.properties.push(feature);
            }
        }

        return features;
    }

    private *getUsedProperties(node: TsNode): Iterable<Property> {
        const astNodeStream = depthFirstSearch(node, (node) => node.getChildren());

        for (const astNode of astNodeStream) {
            if (ts.isPropertyAccessExpression(astNode)) {
                const accessorCode = astNode.getText();
                const accessorPath = accessorCode.split(".");
                if (accessorPath[0] === "this" || accessorPath[0] === "super") {
                    console.log(accessorPath[1], astNode.modifiers);
                    yield this.propertyFactory.make(accessorPath[1], astNode.modifiers, PropertyType.Field);
                }
            }
        }
    }

    private parseFile(targetFilePath: string): SourceFile {
        const targetFileData = fs.readFileSync(targetFilePath).toString();

        return ts.createSourceFile(
            path.basename(targetFilePath),
            targetFileData,
            ts.ScriptTarget.ES2017,
            true,
        );
    }
}

class MyError extends Error {}

enum PropertyType {
    Field,
    Method,
}

class Property {
    constructor(
        public readonly name: string,
        public readonly modifiers: ts.ModifiersArray | undefined,
        public readonly propertyType: PropertyType
    ) {}
}

/**
 * Used to ensure that there are no 2 instances of the Property class for the same property
 */
class PropertyFactory {
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
