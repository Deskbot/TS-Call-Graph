export class Digraph<N> {
    private readonly nodeToNode: Map<N, Set<N>>;

    constructor() {
        this.nodeToNode = new Map();
    }

    addEdge(n1: N, n2: N) {
        const mappedTo = this.nodeToNode.get(n1);

        if (mappedTo) {
            mappedTo.add(n2);
        } else {
            this.nodeToNode.set(n1, new Set().add(n2));
        }

        return this;
    }

    addNode(n: N) {
        if (!this.nodeToNode.has(n)) {
            this.nodeToNode.set(n, new Set());
        }
    }
}