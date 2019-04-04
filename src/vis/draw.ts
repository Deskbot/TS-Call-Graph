import * as d3 from "d3";

import { data } from "./d3Input";

type LinkInput = {
    source: string;
    target: string;
    value: number;
};

type Link = {
    source: Node;
    target: Node;
    value: number;
} & d3.SimulationLinkDatum<Node>;

type Node = {
    id: string;
    group: number;
} & d3.SimulationNodeDatum;

const links: Link[] = data.links.map(node => Object.create(node));
const nodes: Node[] = data.nodes.map(node => Object.create(node));

const height = 350;
const width = 700;

const container = d3.select("#ts-call-graph").append("svg")
    .attr("height", height)
    .attr("width", width);

d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody()
        .strength(-50))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("no-overlap", d3.forceCollide)
    .force("edges", d3.forceLink<Node, Link>(links)
        .id(node => node.id)
        .distance(20)
        .strength(30))
    .on("tick", onTick);

function onTick() {
    const allNodeTags = d3.select("svg")
        .selectAll<SVGCircleElement, Node>("circle")
        .data(nodes);

    allNodeTags.enter()
        .append("circle")
        .attr("r", 5)
        .merge(allNodeTags)
        .attr("cx", node => node.x!)
        .attr("cy", node => node.y!);

    allNodeTags.exit().remove();

    const allEdgeTags = d3.select("svg")
        .selectAll<SVGLineElement, Link>("line")
        .data(links);

    allEdgeTags.enter()
        .append("line")
        .merge(allEdgeTags)
        .attr("x1", edge => edge.source.x!)
        .attr("y1", edge => edge.source.y!)
        .attr("x2", edge => edge.target.x!)
        .attr("y2", edge => edge.target.y!);

    allEdgeTags.exit().remove();
}