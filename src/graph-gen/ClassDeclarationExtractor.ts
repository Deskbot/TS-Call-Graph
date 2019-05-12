import * as ts from "typescript";

import { Digraph } from "../util/Digraph";
import { MyError } from "../util/error";
import { boolify } from "../util/function";
import { PropertyType, Property } from "./Property";
import { depthFirstSearch } from "../util/traversal";

type ClassFeatures = {
    constructor: Maybe<Property>,
    methods: Property[],
    field: Property[],
};

export class ClassDeclarationExtractor {
    private allProperties: Map<string, Property>;
    private featuresOfTargetClass: ClassFeatures;
    private digraph: Maybe<Digraph<Property>>;
    private targetClass: string;

    constructor(file: ts.SourceFile, targetClass: string) {
        this.targetClass = targetClass;

        const targetClassNode = this.extractClassDeclaration(file, this.targetClass);

        if (targetClassNode === undefined) {
            throw new MyError(`Target class declaration (${this.targetClass}) could not be found.`);
        }

        this.featuresOfTargetClass = this.getClassFeatures(targetClassNode);

        this.allProperties = this.registerAllFeatures(this.featuresOfTargetClass);
    }

    public createDigraph(): Digraph<Property> {
        if (!this.digraph) {
            this.digraph = new Digraph();

            for (const property of this.allProperties.values()) {
                this.digraph.addNode(property);
            }

            if (this.featuresOfTargetClass.constructor) {
                for (const usedProperty of this.getUsedProperties(this.featuresOfTargetClass.constructor.declaration)) {
                    this.digraph.addEdge(this.featuresOfTargetClass.constructor, usedProperty);
                }
            }

            for (const method of this.featuresOfTargetClass.methods) {
                for (const usedProperty of this.getUsedProperties(method.declaration)) {
                    this.digraph.addEdge(method, usedProperty);
                }
            }
        }

        return this.digraph;
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
            const modifiers = ts.getCombinedModifierFlags(feature);
            if (ts.isConstructorDeclaration(feature)) {
                features.constructor = new Property("constructor", modifiers, PropertyType.Method, feature);

            } else if (ts.isMethodDeclaration(feature)
                || ts.isGetAccessorDeclaration(feature)
                || ts.isSetAccessorDeclaration(feature)
            ) {
                const methodName = feature.name ? feature.name!.getText() : `anonymous method ${Math.random()}`; // not sure when this can happen
                features.methods.push(new Property(methodName, modifiers, PropertyType.Method, feature));

            } else if (ts.isPropertyDeclaration(feature)) {
                features.field.push(new Property(feature.name.getText(), modifiers, PropertyType.Field, feature));
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
}
