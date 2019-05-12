import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import * as ts from "typescript";

import * as d3Builder from "./graph-gen/D3Builder";
import { ClassDeclarationExtractor } from "./graph-gen/ClassDeclarationExtractor";
import { MyError } from "./util/error";

main();

function main() {
    let args: string[];
    let targetFilePath: string;
    let targetClass: string;

    try {
        args = process.argv.slice(2); // drop "node" and the file name
        // if the path argument is relative, treat it relative to where the program is ran from
        targetFilePath = args[0][0] === "/"
            ? args[0]
            : process.cwd() + "/" + args[0];
        targetClass = args[1];
    } catch (ignore) {
        throw new MyError("Usage: arg1: target file path, arg2: target class name");
    }

    const declarationExtractor = new ClassDeclarationExtractor(parseFile(targetFilePath), targetClass);
    const digraphRepresentation = declarationExtractor.createDigraph();

    const [nodeInputs, edgesInputs] = d3Builder.build(digraphRepresentation);

    const dataFileObject = {
        nodes: nodeInputs,
        links: edgesInputs,
    };

    console.log(JSON.stringify(dataFileObject));
}

function parseFile(targetFilePath: string): ts.SourceFile {
    const targetFileData = fs.readFileSync(targetFilePath).toString();

    return ts.createSourceFile(
        path.basename(targetFilePath),
        targetFileData,
        ts.ScriptTarget.ES2017,
        true,
    );
}