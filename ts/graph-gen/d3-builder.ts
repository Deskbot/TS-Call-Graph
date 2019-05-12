import { Digraph } from "../util/Digraph";
import { Property, Privacy } from "./property";
import { EasyMap } from "../util/EasyMap";

export type NodeInput = {
    childCount: number,
    name: string,
    parentCount: number,
    privacy: Privacy,
};

export type LinkInput = {
    source: string,
    target: string,
};

export function build(digraph: Digraph<Property>): [NodeInput[], LinkInput[]] {
    const nodes: NodeInput[] = [];
    const links: LinkInput[] = [];
    const parentCounts: EasyMap<string, number> = new EasyMap();

    for (const [propertyFrom, propertiesTo] of digraph.entries) {
        if (!propertyFrom) {
            continue; // ignore any undefined propertyfroms
        }

        nodes.push(propertyToNodeInput(
            propertyFrom,
            propertiesTo.size,
            propertyFrom.privacy
        ));

        const fromId = propertyFrom.name;
        for (const to of propertiesTo) {
            // elements on the super class are undefined here
            if (!to) {
                continue;
            }

            const idOfTo = to.name;

            parentCounts.change(idOfTo, 0, count => count + 1);

            links.push({
                source: fromId,
                target: idOfTo,
            });
        }
    }

    nodes.forEach(node => {
        node.parentCount = parentCounts.get(node.name) || 0;
    })

    return [nodes, links];
}

function propertyToNodeInput(property: Property, childCount: number, privacy: Privacy): NodeInput {
    return {
        childCount,
        name: property.name,
        parentCount: 0,
        privacy,
    };
}
