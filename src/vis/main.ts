import { draw } from "./draw";
import { GraphEdgeInput, GraphNode } from "./types";

import { data } from "./example1D3Input";

const links: GraphEdgeInput[] = data.links.map(node => Object.create(node));
const nodes: GraphNode[] = data.nodes.map(node => Object.create(node));

draw(nodes, links);