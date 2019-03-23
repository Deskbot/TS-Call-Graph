export class OneToManyMap<K,V> {
    private map: Map<K,Set<V>>;

    constructor(MapMaker?: MapConstructor) {
        this.map = MapMaker ? new MapMaker() : new Map();
    }

    clear() {
        this.map.clear();
    }

    delete(k: K, v: V): boolean {
        const mapsTo = this.map.get(k);

        if (mapsTo) {
            return mapsTo.delete(v);
        }

        return false;
    }

    getAll(k: K): Set<V> | undefined {
        return this.map.get(k);
    }

    has(k: K, v: V): boolean {
        const mapsTo = this.getAll(k);

        if (mapsTo) {
            return mapsTo.has(v);
        }

        return false;
    }

    set(k: K, v: V): this {
        const mappedTo = this.map.get(k);

        if (mappedTo) {
            mappedTo.add(v);
        } else {
            this.map.set(k, new Set().add(v));
        }

        return this;
    }

    toMap() {
        return this.map;
    }
}