import * as d3 from "d3";
import * as ts from "typescript";

import { GraphNode, GraphEdgeInput, GraphEdge } from "./types";

const height = 9000;
const width = 9000;

const radius = 10;
const LINK_FORCE = 15;

export function draw(nodes: GraphNode[], links: GraphEdgeInput[]) {
    const highestParentCount = nodes.reduce((highestCount, next) => highestCount > next.parentCount ? highestCount : next.parentCount, 0);
    const highestChildCount = nodes.reduce((highestCount, next) => highestCount > next.childCount ? highestCount : next.childCount, 0);

    d3.select("#ts-call-graph")
        .attr("height", height)
        .attr("width", width);

    const textAndNodeDragBehaviour = d3.drag<any, GraphNode>()
        .on("start", () => {
            // prevent normal browser behaviour from taking place
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", datum => {
            datum.x = d3.event.x;
            datum.y = d3.event.y;
            forceBehaviour.restart();
        });

    const forceBehaviour = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody<GraphNode>().strength(-50))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("more-neighbours-more-personal-space", d3.forceCollide<GraphNode>(datum => datum.neighbourCount * radius + 50))
        .force("edges", d3.forceLink<GraphNode, GraphEdgeInput>(links)
            .id(node => node.name)
            .distance(radius * LINK_FORCE)
            .strength(1))
        .force("pull-nodes-with-more-children-up", d3.forceY<GraphNode>(node => node.neighbourCount * LINK_FORCE).strength(2))
        .on("tick", onTick);

    function onTick() {
        const allNodeTags = d3.select("svg")
            .selectAll<SVGCircleElement, GraphNode>("circle")
            .data(nodes);

        allNodeTags.enter()
            .append("circle")
            .merge(allNodeTags)
            .call(textAndNodeDragBehaviour)
            .each((datum, i, selection) => {
                const node = selection[i];
                switch (datum.privacy) {
                    case ts.ModifierFlags.Public:
                        return node.classList.add("public");
                    case ts.ModifierFlags.Private:
                        return node.classList.add("private");
                    case ts.ModifierFlags.Protected:
                        return node.classList.add("protected");
                }
            })
            .attr("r", radius)
            .attr("cx", datum => datum.x!)
            .attr("cy", datum => datum.y!);

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
