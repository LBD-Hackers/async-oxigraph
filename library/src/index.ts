import { TaskType, WorkerInstruction, WorkerResult, ResponseMimetype, RDFMimetype, QueryDefinition, TemplateData } from "./interfaces";

/**
 * Async Oxigraph is a wrapper on top of Oxigraph that allows you to run an oxigraph instance 
 * as a worker process and thereby you will not block your browser's main thread while doing 
 * heavy operations like loading triples into an Oxigraph store.
 * 
 * Developed by Mads Holten Rasmussen
 */

export * from './interfaces';

export class AsyncOxigraph{

    private static _instance: AsyncOxigraph;
    private _worker: Worker;
    private _queryDefs: QueryDefinition[] = [];

    private constructor(workerPath: string){
        this._worker = new Worker(workerPath);
    }

    static getInstance(workerPath: string = "./assets/oxigraph/worker.js") {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new AsyncOxigraph(workerPath);
        return this._instance;
    }

    /**
     * Initialize Oxigraph store
     * @param wasmPath path to the webassembly file relative to the path where the worker.js file is located
     * @returns a worker result with a message
     */
    async init(wasmPath: string = "./web_bg.wasm"): Promise<WorkerResult>{
        return await this._runBackgroundTask({task: TaskType.INIT, initPayload: {wasmPath}});
    }

    /**
     * Load triples into the store
     * @param triples a string containing the RDF triples in a serialization according to the provided mimetype
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param baseURI optionally describes the base namespace
     * @param graphURI optionally describes a named graph in which the triples should be loaded. Default is the main graph
     * @returns 
     */
    async load(triples: string, mimetype: RDFMimetype, baseURI?: string, graphURI?: string): Promise<WorkerResult>{
        return await this._runBackgroundTask({task: TaskType.LOAD, loadPayload: {triples, mimetype, baseURI, graphURI}});
    }

    /**
     * Query the store
     * @param query SPARQL query
     * @param responseMimetype optionally describe the serialization of the returned facts of a construct query
     * @returns 
     */
    async query(query: string, responseMimetype?: ResponseMimetype): Promise<WorkerResult>{
        return await this._runBackgroundTask({task: TaskType.QUERY, queryPayload: {query, responseMimetype}});
    }

    /**
     * Create a dump of the store (serialize)
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param graphURI optianally describes the URI of the named graph to dump
     * @returns 
     */
    async dump(mimetype: RDFMimetype = RDFMimetype.NQUADS, graphURI?: string): Promise<WorkerResult>{
        return await this._runBackgroundTask({task: TaskType.DUMP, dumpPayload: {mimetype, graphURI}});
    }

    /**
     * Get store size
     * @returns the size as a number
     */
    async size(): Promise<number>{
        const query = "SELECT (COUNT(*) AS ?count) WHERE {?s ?p ?o}";
        const res = await this.query(query);
        return parseInt(res.data.results.bindings[0].count.value);
    }

    /**
     * Add a query definition that can easily be executed
     * @param queryDefs array of query definitions 
     */
    addQueryDefinitions(queryDefs: QueryDefinition[] = []): void{
        queryDefs.forEach(query => {
          const match = this._queryDefs.find(q => q.id === query.id);
          if(match === undefined) this._queryDefs.push(query);
        });
    }

    /**
     * Execute a saved query
     * @param queryId the id of the query
     * @param params optional query params to replace in the query
     */
    async execute(queryId: string, params?: TemplateData): Promise<WorkerResult>{
        const queryData = this._queryDefs.find(q => q.id === queryId);
        if(queryData === undefined) throw new Error(`Unknown query with id "${queryId}"`);

        const query = this._replaceHandlebars(queryData.query, params);

        const res = await this.query(query, queryData.responseMimetype);
        res.query = query;
        
        if(queryData.postProcessing !== undefined){
            const initialTime = this._getPostProcessingTime(res.message);
            const t1 = new Date().getTime();
            res.data = await queryData.postProcessing(res.data);
            const t2 = new Date().getTime();
            const dt = (t2-t1)/1000;
            const total = initialTime+dt;
            res.message = res.message.replace(initialTime.toString(), total.toString());
        }

        return res;
    }

    close(){
        this._worker.terminate();
    }

    private async _runBackgroundTask(instruction: WorkerInstruction): Promise<WorkerResult>{
        return new Promise((resolve, reject) => {

            // Resolve result
            this._worker.addEventListener('message', (event) => {
                if(event.data.error != undefined) reject(event.data.error);
                resolve(event.data);
            }, false);

            this._worker.postMessage(instruction); // Send data to our worker.

        })
    }

    private _replaceHandlebars(template: string, data: TemplateData): string {
        const regex = /{{(.*?)}}/g; // Regex to find {{variable}} patterns
      
        return template.replace(regex, (match, variableName) => {
          return data.hasOwnProperty(variableName) ? data[variableName].toString() : '';
          // If the variable exists in the data, replace it; otherwise, replace with an empty string
        });
    }

    private _getPostProcessingTime(text: string): number{
        const match = text.match(/(\d+\.\d+)\s*seconds/);
        return match ? parseFloat(match[1]) : 0;
    }

}