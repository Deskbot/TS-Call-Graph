import * as d3 from "d3";

import { data } from "./example1D3Input";

type LinkInput = {
    source: string;
    target: string;
} & d3.SimulationLinkDatum<Node>;

type Link = {
    source: Node;
    target: Node;
} & d3.SimulationLinkDatum<Node>;

type Node = {
    name: string;
} & d3.SimulationNodeDatum;

const links: LinkInput[] = data.links.map(node => Object.create(node));
const nodes: Node[] = data.nodes.map(node => Object.create(node));

const height = window.innerHeight;
const width = window.innerWidth;

const radius = 10;

d3.select("#ts-call-graph")
    .attr("height", height)
    .attr("width", width);

const nodeDragBehaviour = d3.drag<SVGCircleElement, Node>()
    .on("start", () => {
        // prevent normal browser behaviour from taking place
        d3.event.sourceEvent.stopPropagation();
    })
    .on("drag", (node) => {
        node.x = d3.event.x;
        node.y = d3.event.y;
        forceBehaviour.restart();
    });

const textDragBehaviour = d3.drag<SVGTextElement, Node>()
    .on("start", () => {
        // prevent normal browser behaviour from taking place
        d3.event.sourceEvent.stopPropagation();
    })
    .on("drag", (node) => {
        node.x = d3.event.x;
        node.y = d3.event.y;
        forceBehaviour.restart();
    });

const forceBehaviour = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody()
        .strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("no-overlap", d3.forceCollide()
        .radius(radius * 4))
    .force("edges", d3.forceLink<Node, LinkInput>(links)
        .id(node => node.name)
        .distance(radius * 15)
        .strength(2))
    .on("tick", onTick);

function onTick() {
    const allNodeTags = d3.select("svg")
        .selectAll<SVGCircleElement, Node>("circle")
        .data(nodes);

    allNodeTags.enter()
        .append("circle")
        .call(nodeDragBehaviour)
        .attr("r", radius)
        .merge(allNodeTags)
        .attr("cx", node => node.x!)
        .attr("cy", node => node.y!);

    allNodeTags.exit().remove();

    const allEdgeTags = d3.select("svg")
        .selectAll<SVGLineElement, LinkInput>("line")
        .data(links) as d3.Selection<SVGLineElement, Link, d3.BaseType, {}>;
        // assert that d3 has transformed the link type

    allEdgeTags.enter()
        .append("line")
        .merge(allEdgeTags)
        .attr("marker-end", "url(#arrow-head)")
        .attr("x1", edge => edge.source.x!)
        .attr("y1", edge => edge.source.y!)
        .attr("x2", edge => edge.target.x!)
        .attr("y2", edge => edge.target.y!);

    allEdgeTags.exit().remove();

    const allTextTags = d3.select("svg")
        .selectAll<SVGTextElement, Node>("text")
        .data(nodes);

    allTextTags.enter()
        .append("text")
        .call(textDragBehaviour)
        .merge(allTextTags)
        .attr("x", node => node.x! - 16)
        .attr("y", node => node.y! - 16)
        .text(node => node.name);

    allTextTags.exit().remove();
}

