import { TaskType, WorkerInstruction, WorkerResult, ResponseMimetype } from "./interfaces";

export class AsyncOxigraph{

    private workerPath: string;
    private worker: Worker;

    constructor(workerPath: string){
        this.workerPath = workerPath;
        this.worker = new Worker(workerPath);
    }

    async init(wasmPath?: string): Promise<WorkerResult>{
        return await this.runBackgroundTask({task: TaskType.INIT, initPayload: {wasmPath}});
    }

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