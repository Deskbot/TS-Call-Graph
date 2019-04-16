import * as process from "process";

import * as d3Builder from "./lib/D3Builder";
import { ClassDeclarationExtractor } from "./lib/ClassDeclarationExtractor";
import { MyError } from "./lib/error";

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

    const declarationExtractor = new ClassDeclarationExtractor(targetFilePath, targetClass);
    const digraphRepresentation = declarationExtractor.createDigraph();

    const [nodeInputs, edgesInputs] = d3Builder.build(digraphRepresentation);

    console.log(JSON.stringify(nodeInputs));
    console.log(JSON.stringify(edgesInputs));
}