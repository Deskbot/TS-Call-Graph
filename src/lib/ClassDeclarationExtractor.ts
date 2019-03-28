import * as fs from "fs";
import * as path from "path";
import {
    ClassDeclaration,
    SourceFile,
    Node as TsNode
} from "typescript";
import * as ts from "typescript";

import { Digraph } from "./Digraph";
import { MyError } from "./error";
import { boolify } from "./function";
import { PropertyType, Property } from "./Property";
import { depthFirstSearch } from "./traversal";

type ClassFeatures = {
    constructor: Maybe<ts.ConstructorDeclaration>,
    methods: ts.FunctionLikeDeclaration[],
    properties: ts.PropertyDeclaration[],
};

export type PropertyToMethodsMap = Digraph<Property>;

export class ClassDeclarationExtractor {
    private propertyUsage: PropertyToMethodsMap;
    private targetClass: string;
    private targetFilePath: string;

    constructor(targetFilePath: string, targetClass: string) {
        this.propertyUsage = new Digraph<Property>();
        this.targetClass = targetClass;
        this.targetFilePath = targetFilePath
    }

    public createPropertyUsageMap(): PropertyToMethodsMap {
        const parsedFile = this.parseFile(this.targetFilePath);
        const targetClassNode = this.extractClassDeclaration(parsedFile, this.targetClass);

        if (targetClassNode === undefined) {
            throw new MyError(`Target class declaration (${this.targetClass}) could not be found.`);
        }

        const featuresOfTargetClass = this.getClassFeatures(targetClassNode);

        const allProperties = this.registerAllFeatures(featuresOfTargetClass);

        for (const property of allProperties.values()) {
            this.propertyUsage.addNode(property);
        }
        return this.propertyUsage;
    }

    private registerAllFeatures(featuresOfTargetClass: ClassFeatures): Map<string, Property> {
        const allProperties = new Map<string, Property>();

        for (const property of featuresOfTargetClass.properties) {
            allProperties.set(
                property.name.getText(),
                new Property(property.name.getText(), property.modifiers, PropertyType.Field),
            );
        }

        if (featuresOfTargetClass.constructor) {
            allProperties.set(
                "constructor",
                new Property("constructor", featuresOfTargetClass.constructor.modifiers, PropertyType.Method),
            );
        }

        for (const method of featuresOfTargetClass.methods) {
            const methodName = method.name ? method.name!.getText() : `anonymous method ${Math.random()}`; // not sure when this can happen
            const methodProperty = new Property(methodName, method.modifiers, PropertyType.Method);
            allProperties.set(methodName, methodProperty);
        }

        return allProperties;
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
                    yield new Property(accessorPath[1], astNode.modifiers, PropertyType.Field);
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
