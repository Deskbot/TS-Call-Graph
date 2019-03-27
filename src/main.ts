import * as process from "process";
import {
    ConstructorDeclaration,
    FunctionLikeDeclaration,
    PropertyDeclaration
} from "typescript";
import { ClassDeclarationExtractor } from "./lib/ClassDeclarationExtractor";
import { MyError } from "./lib/error";

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
