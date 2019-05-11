import { Privacy } from "../lib/Property";

export type GraphNode = {
    childCount: number;
    name: string;
    privacy: Privacy;
} & d3.SimulationNodeDatum;

export type GraphEdgeInput = {
    source: string;
    target: string;
} & d3.SimulationLinkDatum<GraphNode>;

export type GraphEdge = {
    source: GraphNode;
    target: GraphNode;
} & d3.SimulationLinkDatum<GraphNode>;