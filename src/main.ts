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
        console.error("Usage: arg1: target file path, arg2: target class name");
        return;
    }

    const parsedFile = parseFile(targetFilePath);

    // find given class
    const targetClassNode = extractClassDeclaration(parsedFile, targetClass);

    if (targetClassNode === undefined) {
        console.error(`Target class declaration (${targetClass}) could not be found.`);
        return;
    }

    const { constructor, methods, properties } = getClassFeatures(targetClassNode);

    const map = new OneToManyMap<string, string>();

    // register constructor -> field
    if (constructor) {
        for (const property of getUsedProperties(constructor)) {
            map.set("constructor", property);
        }
    }

    // register constructor -> method
    // register method -> field
    // reigst method -> method
    // accessors -> field
    // accessors -> method

    console.log(map);

    // build a d3 config object
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

    for (let feature of cls.members) {
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
