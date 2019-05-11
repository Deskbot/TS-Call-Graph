import { Digraph } from "./Digraph";
import { Property, Privacy } from "./Property";
import * as ts from "typescript";

type NodeInput = {
    childCount: number,
    name: string,
    privacy: Privacy,
};

type LinkInput = {
    source: string,
    target: string,
};

export function build(digraph: Digraph<Property>): [NodeInput[], LinkInput[]] {
    const nodes: NodeInput[] = [];
    const links: LinkInput[] = [];

    for (const [propertyFrom, propertiesTo] of digraph.entries) {
        if (!propertyFrom) {
            continue; // ignore any undefined propertyfroms
        }

        nodes.push(propertyToNodeInput(
            propertyFrom,
            propertiesTo.size,
            propertyFrom.privacy
        ));

        const fromId = propertyToNodeId(propertyFrom);
        for (const to of propertiesTo) {
            // elements on the super class are undefined here
            if (!to) {
                continue;
            }

            links.push({
                source: fromId,
                target: propertyToNodeId(to),
            });
        }
    }

    return [nodes, links];
}

function propertyToNodeInput(property: Property, childCount: number, privacy: Privacy): NodeInput {
    return {
        childCount,
        name: propertyToNodeId(property),
        privacy,
    };
}

function propertyToNodeId(source: Property): string {
    return source.name;
}