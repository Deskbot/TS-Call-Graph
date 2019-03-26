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

main();

type Maybe<T> = T | undefined;

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

    const map = createFieldUsageMapForClassInFile(targetFilePath, targetClass);

    console.log(map);

    // build a d3 config object
}

function createFieldUsageMapForClassInFile(targetFilePath: string, targetClass: string): OneToManyMap<string, string> {
    const parsedFile = parseFile(targetFilePath);
    const targetClassNode = extractClassDeclaration(parsedFile, targetClass);

    if (targetClassNode === undefined) {
        throw new MyError(`Target class declaration (${targetClass}) could not be found.`);
    }

    const featuresOfTargetClass = getClassFeatures(targetClassNode);

    // want to include all properties on the eventual graph
    // but it shouldn't be done this way
    // for (const property of featuresOfTargetClass.properties) {
    //     property.name.getText();
    // }

    return buildMapOfUsedProperties(featuresOfTargetClass);
}

function buildMapOfUsedProperties(classFeatures: ClassFeatures): OneToManyMap<string, string> {
    const { constructor, methods, properties } = classFeatures;

    const map = new OneToManyMap<string, string>();

    if (constructor) {
        for (const property of getUsedProperties(constructor)) {
            map.set("constructor", property);
        }
    }

    for (const method of methods) {
        let methodName = method.name ? method.name!.getText() : `anonymous method ${Math.random()}`;

        for (const property of getUsedProperties(method)) {
            map.set(methodName, property);
        }
    }

    return map;
}

function extractClassDeclaration(file: SourceFile, className: string): Maybe<ClassDeclaration> {
    return file.statements
        .filter(identity)
        .filter(ts.isClassDeclaration)
        .find((classDec) => classDec.name !== undefined && classDec.name.text === className);
}

function identity<T>(val: T): T {
    return val;
}

type ClassFeatures = {
    constructor: Maybe<ConstructorDeclaration>,
    methods: FunctionLikeDeclaration[],
    properties: PropertyDeclaration[],
};

function getClassFeatures(cls: ClassDeclaration): ClassFeatures {
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

function* getUsedProperties(node: TsNode): Iterable<string> {
    const astNodeStream = depthFirstSearch(node, (node) => node.getChildren());

    for (const astNode of astNodeStream) {
        if (ts.isPropertyAccessExpression(astNode)) {
            const accessorCode = astNode.getText();
            const accessorPath = accessorCode.split(".");
            if (accessorPath[0] === "this" || accessorPath[0] === "super") {
                yield accessorPath[0] + "." + accessorPath[1];
            }
        }
    }
}

function parseFile(targetFilePath: string): SourceFile {
    const targetFileData = fs.readFileSync(targetFilePath).toString();

    return ts.createSourceFile(
        path.basename(targetFilePath),
        targetFileData,
        ts.ScriptTarget.ES2017,
        true,
    );
}

class MyError extends Error {}
