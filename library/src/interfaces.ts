export interface WorkerInstruction{
    task: TaskType;
    dumpPayload?: DumpPayload;
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
    mimetype: RDFMimetype;
    baseURI?: string;
    graphURI?: string;
}

export interface DumpPayload{
    mimetype: RDFMimetype;
    graphURI?: string;
}

export enum TaskType{
    DUMP="DUMP",
    INIT="INIT",
    LOAD="LOAD",
    QUERY="QUERY"
}

// Only for CONSTRUCT queries
// SELECT queries are always returned as [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/)
export enum ResponseMimetype{
    JSONLD="application/ld+json",
    TURTLE="text/turtle"
}

export enum RDFMimetype{
    TURTLE="text/turtle",
    NTRIPLES="application/n-triples",
    NQUADS="application/n-quads",
    RDFXML="application/rdf+xml"
}