import { NodeInput, LinkInput } from "../graph-gen/d3-builder";

export type GraphNode = NodeInput & d3.SimulationNodeDatum;

export type GraphEdgeInput = LinkInput & d3.SimulationLinkDatum<GraphNode>;

export type GraphEdge = {
    source: GraphNode;
    target: GraphNode;
} & d3.SimulationLinkDatum<GraphNode>;