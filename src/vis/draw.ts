import * as d3 from "d3";
import { GraphNode, GraphEdgeInput, GraphEdge } from "./types";

const height = window.innerHeight;
const width = window.innerWidth;

const radius = 10;

export function draw(nodes: GraphNode[], links: GraphEdgeInput[]) {
    d3.select("#ts-call-graph")
        .attr("height", height)
        .attr("width", width);

    const textAndNodeDragBehaviour = d3.drag<any, GraphNode>()
        .on("start", () => {
            // prevent normal browser behaviour from taking place
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", node => {
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
        .force("edges", d3.forceLink<GraphNode, GraphEdgeInput>(links)
            .id(node => node.name)
            .distance(radius * 15)
            .strength(2))
        .on("tick", onTick);

    function onTick() {
        const allNodeTags = d3.select("svg")
            .selectAll<SVGCircleElement, GraphNode>("circle")
            .data(nodes);

        allNodeTags.enter()
            .append("circle")
            .merge(allNodeTags)
            .call(textAndNodeDragBehaviour)
            .attr("r", radius)
            .attr("cx", node => node.x!)
            .attr("cy", node => node.y!);

        allNodeTags.exit().remove();

        const allEdgeTags = d3.select<SVGElement, GraphEdgeInput>("svg")
            .selectAll<SVGLineElement, GraphEdge>("line")
            .data(links) as d3.Selection<SVGLineElement, GraphEdge, SVGElement, GraphEdgeInput>;
        // assert that d3 has transformed the edge type from GraphEdgeInput to GraphEdge

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
            .selectAll<SVGTextElement, GraphNode>("text")
            .data(nodes);

        allTextTags.enter()
            .append("text")
            .merge(allTextTags)
            .call(textAndNodeDragBehaviour)
            .attr("x", node => node.x! - 16)
            .attr("y", node => node.y! - 16)
            .text(node => node.name);

        allTextTags.exit().remove();
    }
}
