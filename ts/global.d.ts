type FileReaderLoadEvent = ProgressEvent & {
    target: {
        result: string
    }
};

type Maybe<T> = T | undefined;
