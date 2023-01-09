import { WorkerResult, ResponseMimetype } from "./interfaces";
/**
 * Async Oxigraph is a wrapper on top of Oxigraph that allows you to run an oxigraph instance
 * as a worker process and thereby you will not block your browser's main thread while doing
 * heavy operations like loading triples into an Oxigraph store.
 *
 * Developed by Mads Holten Rasmussen
 */
export * from './interfaces';
export declare class AsyncOxigraph {
    private worker;
    constructor(workerPath: string);
    /**
     *
     * @param wasmPath path to the webassembly file relative to the path where the worker.js file is located
     * @returns a worker result with a message
     */
    init(wasmPath?: string): Promise<WorkerResult>;
    /**
     *
     * @param triples a string containing the RDF triples in a serialization according to the provided mimetype
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param baseURI optionally describes the base namespace
     * @param graphURI optionally describes a named graph in which the triples should be loaded. Default is the main graph
     * @returns
     */
    load(triples: string, mimetype: string, baseURI?: string, graphURI?: string): Promise<WorkerResult>;
    query(query: string, responseMimetype?: ResponseMimetype): Promise<WorkerResult>;
    close(): void;
    private runBackgroundTask;
}
