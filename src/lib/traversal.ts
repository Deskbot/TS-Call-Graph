export function* depthFirstSearch<N>(root: N, getChildNodes: (n: N) => Iterable<N>): Iterable<N> {
    yield root;

    for (const child of getChildNodes(root)) {
        yield* depthFirstSearch(child, getChildNodes);
    }
}
