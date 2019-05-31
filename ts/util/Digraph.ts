export class Digraph<N> {
    private readonly nodeToNodes: Map<N, Set<N>>;

    constructor() {
        this.nodeToNodes = new Map();
    }

    addEdge(n1: N, n2: N) {
        const mappedTo = this.nodeToNodes.get(n1);

        if (mappedTo) {
            mappedTo.add(n2);
        } else {
            this.nodeToNodes.set(n1, new Set<N>().add(n2));
        }

        return this;
    }

    addNode(n: N) {
        if (!this.nodeToNodes.has(n)) {
            this.nodeToNodes.set(n, new Set());
        }
    }

    get entries(): IterableIterator<[N, Set<N>]> {
        return this.nodeToNodes.entries();
    }

    get nodes(): IterableIterator<N> {
        return this.nodeToNodes.keys();
    }
}