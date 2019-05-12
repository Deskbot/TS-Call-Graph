export function boolify<T>(val: T): boolean {
    return !!val;
}

export type IsEqual<T> = (left: T, right: T) => boolean;