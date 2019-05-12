import * as ts from "typescript";

import * as d3Builder from "../graph-gen/d3-builder";

import { draw } from "./draw";
import { ClassDeclarationExtractor } from "../graph-gen/ClassDeclarationExtractor";

const controlsDiv = document.getElementById("controls") as HTMLDivElement;
const startInput = document.getElementById("start-button") as HTMLButtonElement;
const fileInput = document.getElementById("file") as HTMLInputElement;
const classNameInput = document.getElementById("class-name") as HTMLInputElement;

startInput.addEventListener("click", () => {
    if (fileInput.files && fileInput.files.length > 0) {
        const reader = new FileReader();
        const file = fileInput.files[0];
        reader.readAsText(file);

        reader.addEventListener("load", event => {
            const e = event as FileReaderLoadEvent;
            console.log(e.target.result);

            drawGraph(file.name, e.target.result);

            controlsDiv.remove();
        });

        reader.addEventListener("error", event => {
            console.log(event);
            alert("File upload aborted.");
        });

        reader.addEventListener("abort", event => {
            console.log(event);
            alert("File upload aborted.");
        });
    }
});

function drawGraph(fileName: string, tsCode: string) {
    const declarationExtractor = new ClassDeclarationExtractor(
        ts.createSourceFile(
            fileName,
            tsCode,
            ts.ScriptTarget.ES2017,
            true,
        ),
        classNameInput.value
    );

    const digraphRepresentation = declarationExtractor.createDigraph();

    const [nodeInputs, edgesInputs] = d3Builder.build(digraphRepresentation);

    draw(shuffle(nodeInputs), shuffle(edgesInputs));
}

function shuffle<T>(arr: T[]): T[] {
    for (let i = 0; i < arr.length; i++) {
        let tmp = arr[i];
        let targetIndex = Math.floor(Math.random() * arr.length);
        arr[i] = arr[targetIndex];
        arr[targetIndex] = tmp;
    }

    return arr;
}
