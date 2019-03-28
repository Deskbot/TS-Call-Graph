import * as fs from "fs";
import * as path from "path";
import * as ts from "typescript";

import { Digraph } from "./Digraph";
import { MyError } from "./error";
import { boolify } from "./function";
import { PropertyType, Property } from "./Property";
import { depthFirstSearch } from "./traversal";

type ClassFeatures = {
    constructor: Maybe<Property>,
    methods: Property[],
    field: Property[],
};

export class ClassDeclarationExtractor {
    private allProperties: Map<string, Property>;
    private featuresOfTargetClass: ClassFeatures;
    private propertyUsage: Maybe<Digraph<Property>>;
    private targetClass: string;
    private targetFilePath: string;

    constructor(targetFilePath: string, targetClass: string) {
        this.targetClass = targetClass;
        this.targetFilePath = targetFilePath

        const parsedFile = this.parseFile(this.targetFilePath);
        const targetClassNode = this.extractClassDeclaration(parsedFile, this.targetClass);

        if (targetClassNode === undefined) {
            throw new MyError(`Target class declaration (${this.targetClass}) could not be found.`);
        }

        this.featuresOfTargetClass = this.getClassFeatures(targetClassNode);

        this.allProperties = this.registerAllFeatures(this.featuresOfTargetClass);
    }

    public createPropertyUsageMap(): Digraph<Property> {
        if (!this.propertyUsage) {
            this.propertyUsage = new Digraph();

            if (this.featuresOfTargetClass.constructor) {
                for (const usedProperty of this.getUsedProperties(this.featuresOfTargetClass.constructor.declaration)) {
                    this.propertyUsage.addEdge(this.featuresOfTargetClass.constructor, usedProperty);
                }
            }

            for (const method of this.featuresOfTargetClass.methods) {
                for (const usedProperty of this.getUsedProperties(method.declaration)) {
                    this.propertyUsage.addEdge(method, usedProperty);
                }
            }
        }

        return this.propertyUsage;
    }

    private registerAllFeatures(featuresOfTargetClass: ClassFeatures): Map<string, Property> {
        const allProperties = new Map<string, Property>();

        for (const field of featuresOfTargetClass.field) {
            allProperties.set(field.name, field);
        }

        if (featuresOfTargetClass.constructor) {
            allProperties.set(featuresOfTargetClass.constructor.name, featuresOfTargetClass.constructor);
        }

        for (const method of featuresOfTargetClass.methods) {
            allProperties.set(method.name, method);
        }

        return allProperties;
    }

    private extractClassDeclaration(file: ts.SourceFile, className: string): Maybe<ts.ClassDeclaration> {
        return file.statements
            .filter(boolify)
            .filter(ts.isClassDeclaration)
            .find((classDec) => classDec.name !== undefined && classDec.name.text === className);
    }

    private getClassFeatures(cls: ts.ClassDeclaration): ClassFeatures {
        const features: ClassFeatures = {
            constructor: undefined,
            field: [],
            methods: [],
        };

        for (const feature of cls.members) {
            if (ts.isConstructorDeclaration(feature)) {
                features.constructor = new Property("constructor", feature.modifiers, PropertyType.Method, feature);

            } else if (ts.isMethodDeclaration(feature)
                || ts.isGetAccessorDeclaration(feature)
                || ts.isSetAccessorDeclaration(feature)
            ) {
                const methodName = feature.name ? feature.name!.getText() : `anonymous method ${Math.random()}`; // not sure when this can happen
                features.methods.push(new Property(methodName, feature.modifiers, PropertyType.Method, feature));

            } else if (ts.isPropertyDeclaration(feature)) {
                features.field.push(new Property(feature.name.getText(), feature.modifiers, PropertyType.Field, feature));
            }
        }

        return features;
    }

    private *getUsedProperties(node: ts.Node): Iterable<Property> {
        const astNodeStream = depthFirstSearch(node, (node) => node.getChildren());

        for (const astNode of astNodeStream) {
            if (ts.isPropertyAccessExpression(astNode)) {
                const accessorCode = astNode.getText();
                const accessorPath = accessorCode.split(".");
                const prefix = accessorPath[0];
                const name = accessorPath[1];
                if (prefix === "this" || prefix === "super" || prefix === this.targetClass) {
                    yield this.allProperties.get(name)!;
                }
            }
        }
    }

    private parseFile(targetFilePath: string): ts.SourceFile {
        const targetFileData = fs.readFileSync(targetFilePath).toString();

        return ts.createSourceFile(
            path.basename(targetFilePath),
            targetFileData,
            ts.ScriptTarget.ES2017,
            true,
        );
    }
}
