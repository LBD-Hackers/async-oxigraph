import { WorkerResult, ResponseMimetype, RDFMimetype, QueryDefinition, TemplateData } from "./interfaces";
/**
 * Async Oxigraph is a wrapper on top of Oxigraph that allows you to run an oxigraph instance
 * as a worker process and thereby you will not block your browser's main thread while doing
 * heavy operations like loading triples into an Oxigraph store.
 *
 * Developed by Mads Holten Rasmussen
 */
export * from './interfaces';
export declare class AsyncOxigraph {
    private static _instance;
    private _worker;
    private _queryDefs;
    private constructor();
    static getInstance(workerPath?: string): AsyncOxigraph;
    /**
     * Initialize Oxigraph store
     * @param wasmPath path to the webassembly file relative to the path where the worker.js file is located
     * @returns a worker result with a message
     */
    init(wasmPath?: string): Promise<WorkerResult>;
    /**
     * Load triples into the store
     * @param triples a string containing the RDF triples in a serialization according to the provided mimetype
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param baseURI optionally describes the base namespace
     * @param graphURI optionally describes a named graph in which the triples should be loaded. Default is the main graph
     * @returns
     */
    load(triples: string, mimetype: RDFMimetype, baseURI?: string, graphURI?: string): Promise<WorkerResult>;
    /**
     * Query the store
     * @param query SPARQL query
     * @param responseMimetype optionally describe the serialization of the returned facts of a construct query
     * @returns
     */
    query(query: string, responseMimetype?: ResponseMimetype): Promise<WorkerResult>;
    /**
     * Create a dump of the store (serialize)
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param graphURI optianally describes the URI of the named graph to dump
     * @returns
     */
    dump(mimetype?: RDFMimetype, graphURI?: string): Promise<WorkerResult>;
    /**
     * Get store size
     * @returns the size as a number
     */
    size(): Promise<number>;
    /**
     * Add a query definition that can easily be executed
     * @param queryDefs array of query definitions
     */
    addQueryDefinitions(queryDefs?: QueryDefinition[]): void;
    /**
     * Execute a saved query
     * @param queryId the id of the query
     * @param params optional query params to replace in the query
     */
    execute(queryId: string, params?: TemplateData): Promise<WorkerResult>;
    close(): void;
    private _runBackgroundTask;
    private _replaceHandlebars;
    private _getPostProcessingTime;
}
