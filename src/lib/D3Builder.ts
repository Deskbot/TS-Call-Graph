import { Digraph } from "./Digraph";
import { Property, Privacy } from "./Property";
import { EasyMap } from "./EasyMap";

export type NodeInput = {
    childCount: number,
    name: string,
    neighbourCount: number,
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
        node.neighbourCount = node.childCount + (parentCounts.get(node.name) || 0);
    })

    return [nodes, links];
}

function propertyToNodeInput(property: Property, childCount: number, privacy: Privacy): NodeInput {
    return {
        childCount,
        name: property.name,
        neighbourCount: 0,
        privacy,
    };
}
