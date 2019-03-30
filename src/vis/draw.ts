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

const links: Link[] = data.links.map(d => Object.create(d));
const nodes: Node[] = data.nodes.map(d => Object.create(d));

const height = 500;
const width = 500;

const container = d3.select('#ts-call-graph').append('svg')
    .attr('height', width)
    .attr('width', height);

d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))
    .on('tick', onTick);

function onTick() {
    const selectedCircles = d3.select('svg')
        .selectAll<SVGCircleElement, Node>('circle')
        .data(nodes);

    selectedCircles.enter()
        .append('circle')
        .attr('r', 5)
        .merge(selectedCircles)
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!);

    selectedCircles.exit().remove();
}