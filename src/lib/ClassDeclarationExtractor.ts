import * as fs from "fs";
import * as path from "path";
import {
    ClassDeclaration,
    SourceFile,
    Node as TsNode
} from "typescript";
import * as ts from "typescript";

import { PropertyFactory, PropertyType, Property } from "./Property";
import { MyError } from "./error";
import { OneToManyMap } from "./OneToManyMap";
import { boolify } from "./function";
import { depthFirstSearch } from "./traversal";

type ClassFeatures = {
    constructor: Maybe<ts.ConstructorDeclaration>,
    methods: ts.FunctionLikeDeclaration[],
    properties: ts.PropertyDeclaration[],
};

export type PropertyToMethodsMap = OneToManyMap<Property, Property>;

export class ClassDeclarationExtractor {
    private propertyFactory: PropertyFactory;
    private targetClass: string;
    private targetFilePath: string;
    private usedProperties: OneToManyMap<Property, Property>;

    constructor(targetFilePath: string, targetClass: string) {
        this.propertyFactory = new PropertyFactory();
        this.targetClass = targetClass;
        this.targetFilePath = targetFilePath
        this.usedProperties = new OneToManyMap<Property, Property>();
    }

    public createPropertyUsageMap(): PropertyToMethodsMap {
        const parsedFile = this.parseFile(this.targetFilePath);
        const targetClassNode = this.extractClassDeclaration(parsedFile, this.targetClass);

        if (targetClassNode === undefined) {
            throw new MyError(`Target class declaration (${this.targetClass}) could not be found.`);
        }

        const featuresOfTargetClass = this.getClassFeatures(targetClassNode);

        this.buildMapOfUsedProperties(featuresOfTargetClass);

        // want to include all properties on the eventual graph even if nothing maps to them
        for (const property of featuresOfTargetClass.properties) {
            this.usedProperties.setKey(this.propertyFactory.make(property.name.getText(), property.modifiers, PropertyType.Field));
        }

        return this.usedProperties;
    }

    private buildMapOfUsedProperties(classFeatures: ClassFeatures): PropertyToMethodsMap {
        const { constructor, methods } = classFeatures;

        if (constructor) {
            const constr = this.propertyFactory.make("constructor", constructor.modifiers, PropertyType.Method);
            for (const property of this.getUsedProperties(constructor)) {
                this.usedProperties.set(property, constr);
            }
        }

        for (const method of methods) {
            let methodName = method.name ? method.name!.getText() : `anonymous method ${Math.random()}`; // not sure when this can happen

            for (const property of this.getUsedProperties(method)) {
                this.usedProperties.set(property, this.propertyFactory.make(methodName, method.modifiers, PropertyType.Method));
            }
        }

        return this.usedProperties;
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
                if (accessorPath[0] === "this" || accessorPath[0] === "super" || accessorPath[0] === this.targetClass) {
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
