import * as d3 from "d3";

import { data } from "./d3Input";

type Link = {
    source: string;
    target: string;
    value: number;
};

type Node = {
    id: string;
    group: number;
} & d3.SimulationNodeDatum;

const links: Link[] = data.links.map(node => Object.create(node));
const nodes: Node[] = data.nodes.map(node => Object.create(node));

const height = 1500;
const width = 1000;

const container = d3.select('#ts-call-graph').append('svg')
    .attr('height', width)
    .attr('width', height);

d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(-5))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('no-overlap', d3.forceCollide)
    .force('edges', d3.forceLink<Node, Link>(links)
        .id(node => node.id)
        .distance(20)
        .strength(1))
    .on('tick', onTick);

function onTick() {
    const selectedCircles = d3.select('svg')
        .selectAll<SVGCircleElement, Node>('circle')
        .data(nodes);

    selectedCircles.enter()
        .append('circle')
        .attr('r', 5)
        .merge(selectedCircles)
        .attr('cx', node => node.x!)
        .attr('cy', node => node.y!);

    selectedCircles.exit().remove();
}