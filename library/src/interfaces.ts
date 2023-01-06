export interface WorkerInstruction{
    task: TaskType;
    initPayload?: InitPayload;
    loadPayload?: LoadPayload;
    queryPayload?: QueryPayload;
}

export interface WorkerResult{
    task: TaskType;
    message: string;
    data?: any;
    error?: string;
}

export interface InitPayload{
    wasmPath?: string;
}

export interface QueryPayload{
    query: string;
    responseMimetype?: ResponseMimetype;
}

export interface LoadPayload{
    triples: string;
    mimetype: string;
    baseURI?: string;
    graphURI?: string;
}

export enum TaskType{
    INIT="INIT",
    LOAD="LOAD",
    QUERY="QUERY"
}

export enum ResponseMimetype{
    JSONLD="application/ld+json",
    TURTLE="text/turtle",
    JSON="application/sparql-results+json"
}

export enum RDFMimetype{
    JSONLD="application/ld+json",
    TURTLE="text/turtle",
    NTRIPLES="application/n-triples"
}