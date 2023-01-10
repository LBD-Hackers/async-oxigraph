// src/interfaces.ts
var TaskType = /* @__PURE__ */ ((TaskType2) => {
  TaskType2["DUMP"] = "DUMP";
  TaskType2["INIT"] = "INIT";
  TaskType2["LOAD"] = "LOAD";
  TaskType2["QUERY"] = "QUERY";
  return TaskType2;
})(TaskType || {});
var ResponseMimetype = /* @__PURE__ */ ((ResponseMimetype3) => {
  ResponseMimetype3["JSONLD"] = "application/ld+json";
  ResponseMimetype3["TURTLE"] = "text/turtle";
  return ResponseMimetype3;
})(ResponseMimetype || {});
var RDFMimetype = /* @__PURE__ */ ((RDFMimetype2) => {
  RDFMimetype2["TURTLE"] = "text/turtle";
  RDFMimetype2["NTRIPLES"] = "application/n-triples";
  RDFMimetype2["NQUADS"] = "application/n-quads";
  RDFMimetype2["RDFXML"] = "application/rdf+xml";
  return RDFMimetype2;
})(RDFMimetype || {});

// src/index.ts
var AsyncOxigraph = class {
  constructor(workerPath = "./assets/oxigraph/worker.js") {
    this.worker = new Worker(workerPath);
  }
  async init(wasmPath = "./web_bg.wasm") {
    return await this.runBackgroundTask({ task: "INIT" /* INIT */, initPayload: { wasmPath } });
  }
  async load(triples, mimetype, baseURI, graphURI) {
    return await this.runBackgroundTask({ task: "LOAD" /* LOAD */, loadPayload: { triples, mimetype, baseURI, graphURI } });
  }
  async query(query, responseMimetype) {
    return await this.runBackgroundTask({ task: "QUERY" /* QUERY */, queryPayload: { query, responseMimetype } });
  }
  async dump(mimetype = "application/n-quads" /* NQUADS */, graphURI) {
    return await this.runBackgroundTask({ task: "DUMP" /* DUMP */, dumpPayload: { mimetype, graphURI } });
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
  AsyncOxigraph,
  RDFMimetype,
  ResponseMimetype,
  TaskType
};
