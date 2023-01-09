// src/index.ts
var AsyncOxigraph = class {
  constructor(workerPath) {
    this.worker = new Worker(workerPath);
  }
  async init(wasmPath) {
    return await this.runBackgroundTask({ task: "INIT" /* INIT */, initPayload: { wasmPath } });
  }
  async load(triples, mimetype, baseURI, graphURI) {
    return await this.runBackgroundTask({ task: "LOAD" /* LOAD */, loadPayload: { triples, mimetype, baseURI, graphURI } });
  }
  async query(query, responseMimetype) {
    return await this.runBackgroundTask({ task: "QUERY" /* QUERY */, queryPayload: { query, responseMimetype } });
  }
  close() {
    this.worker.terminate();
  }
  async runBackgroundTask(instruction) {
    return new Promise((resolve, reject) => {
      this.worker.addEventListener("message", (event) => {
        if (event.data.error != void 0)
          reject(event.data.error);
        resolve(event.data);
      }, false);
      this.worker.postMessage(instruction);
    });
  }
};
export {
  AsyncOxigraph
};
