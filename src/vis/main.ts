import { draw } from "./draw";
import { GraphEdgeInput, GraphNode } from "./types";

import { data } from "./XMatrixView";

const links: GraphEdgeInput[] = shuffle(data.links);
const nodes: GraphNode[] =      shuffle(data.nodes);

function shuffle<T>(arr: T[]): T[] {
    for (let i = 0; i < arr.length; i++) {
        let tmp = arr[i];
        let targetIndex = Math.floor(Math.random() * arr.length);
        arr[i] = arr[targetIndex];
        arr[targetIndex] = tmp;
    }

    return arr;
}

draw(nodes, links);