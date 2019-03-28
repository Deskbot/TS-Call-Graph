export class Digraph<N> {
    private readonly nodeToNode: Map<K,Set<V>>;

    constructor() {

    }

    addEdge(n1: N, n2: N) {
        const mappedTo = this.map.get(n1);

        if (mappedTo) {
            mappedTo.add(n2);
        } else {
            this.map.set(n1, new Set().add(n2));
        }

        return this;
    }

    addNode(n: N) {
        this.setKey(n);
    }
}