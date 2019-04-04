import { Digraph } from "./Digraph";
import { Property } from "./Property";

type NodeInput = {
    name: string,
};

type LinkInput = {
    source: string,
    target: string,
};

export function build(digraph: Digraph<Property>): [NodeInput[], LinkInput[]] {
    const nodes: NodeInput[] = [];
    const links: LinkInput[] = [];

    for (const [propertyFrom, propertiesTo] of digraph.entries) {
        nodes.push(propertyToNodeInput(propertyFrom));

        const fromId = propertyToNodeId(propertyFrom);
        for (const to of propertiesTo) {
            links.push({
                source: fromId,
                target: propertyToNodeId(to),
            });
        }
    }

    return [nodes, links];
}

function propertyToNodeInput(property: Property): NodeInput {
    return {
        name: propertyToNodeId(property),
    };
}

function propertyToNodeId(source: Property): string {
    return source.name;
}