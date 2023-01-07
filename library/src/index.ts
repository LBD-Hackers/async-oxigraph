import { TaskType, WorkerInstruction, WorkerResult, ResponseMimetype } from "./interfaces";

/**
 * Async Oxigraph is a wrapper on top of Oxigraph that allows you to run an oxigraph instance 
 * as a worker process and thereby you will not block your browser's main thread while doing 
 * heavy operations like loading triples into an Oxigraph store.
 * 
 * Developed by Mads Holten Rasmussen
 */

export class AsyncOxigraph{

    private worker: Worker;

    constructor(workerPath: string){
        this.worker = new Worker(workerPath);
    }

    /**
     * 
     * @param wasmPath path to the webassembly file relative to the path where the worker.js file is located
     * @returns a worker result with a message
     */
    async init(wasmPath?: string): Promise<WorkerResult>{
        return await this.runBackgroundTask({task: TaskType.INIT, initPayload: {wasmPath}});
    }

    /**
     * 
     * @param triples a string containing the RDF triples in a serialization according to the provided mimetype
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param baseURI optionally describes the base namespace
     * @param graphURI optionally describes a named graph in which the triples should be loaded. Default is the main graph
     * @returns 
     */
    async load(triples: string, mimetype: string, baseURI?: string, graphURI?: string): Promise<WorkerResult>{
        return await this.runBackgroundTask({task: TaskType.LOAD, loadPayload: {triples, mimetype, baseURI, graphURI}});
    }

    async query(query: string, responseMimetype?: ResponseMimetype): Promise<WorkerResult>{
        return await this.runBackgroundTask({task: TaskType.QUERY, queryPayload: {query, responseMimetype}});
    }

    close(){
        this.worker.terminate();
    }

    private async runBackgroundTask(instruction: WorkerInstruction): Promise<WorkerResult>{
        return new Promise((resolve, reject) => {

            // Resolve result
            this.worker.addEventListener('message', (event) => {
                if(event.data.error != undefined) reject(event.data.error);
                resolve(event.data);
            }, false);

            this.worker.postMessage(instruction); // Send data to our worker.

        })
    }

}