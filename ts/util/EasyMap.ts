export class EasyMap<K,V> extends Map<K,V> {
    /**
     * Set an initial value or alter the current value depending on whether a value already exists for the given key.
     * @param key The key whose value to initialise or modify
     * @param initial The value to be used if one doesn't exist yet.
     * @param alter A function that will change the existing value as intended.
     */
    change(key: K, initial: V, alter: (before: V) => V) {
        initial = this.get(key) || initial;
        this.set(key, alter(initial));
    }
}