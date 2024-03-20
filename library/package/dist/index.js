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
  constructor(workerPath) {
    this._queryDefs = [];
    this._worker = new Worker(workerPath);
  }
  static getInstance(workerPath = "./assets/oxigraph/worker.js") {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new AsyncOxigraph(workerPath);
    return this._instance;
  }
  async init(wasmPath = "./web_bg.wasm") {
    return await this._runBackgroundTask({ task: "INIT" /* INIT */, initPayload: { wasmPath } });
  }
  async load(triples, mimetype, baseURI, graphURI) {
    return await this._runBackgroundTask({ task: "LOAD" /* LOAD */, loadPayload: { triples, mimetype, baseURI, graphURI } });
  }
  async query(query, responseMimetype) {
    return await this._runBackgroundTask({ task: "QUERY" /* QUERY */, queryPayload: { query, responseMimetype } });
  }
  async dump(mimetype = "application/n-quads" /* NQUADS */, graphURI) {
    return await this._runBackgroundTask({ task: "DUMP" /* DUMP */, dumpPayload: { mimetype, graphURI } });
  }
  async size() {
    const query = "SELECT (COUNT(*) AS ?count) WHERE {?s ?p ?o}";
    const res = await this.query(query);
    return parseInt(res.data.results.bindings[0].count.value);
  }
  addQueryDefinitions(queryDefs = []) {
    queryDefs.forEach((query) => {
      const match = this._queryDefs.find((q) => q.id === query.id);
      if (match === void 0)
        this._queryDefs.push(query);
    });
  }
  async execute(queryId, params) {
    const queryData = this._queryDefs.find((q) => q.id === queryId);
    if (queryData === void 0)
      throw new Error(`Unknown query with id "${queryId}"`);
    const query = this._replaceHandlebars(queryData.query, params);
    const res = await this.query(query, queryData.responseMimetype);
    res.query = query;
    if (queryData.postProcessing !== void 0) {
      const initialTime = this._getPostProcessingTime(res.message);
      const t1 = new Date().getTime();
      res.data = await queryData.postProcessing(res.data);
      const t2 = new Date().getTime();
      const dt = (t2 - t1) / 1e3;
      const total = initialTime + dt;
      res.message = res.message.replace(initialTime.toString(), total.toString());
    }
    return res;
  }
  close() {
    this._worker.terminate();
  }
  async _runBackgroundTask(instruction) {
    return new Promise((resolve, reject) => {
      this._worker.addEventListener("message", (event) => {
        if (event.data.error != void 0)
          reject(event.data.error);
        resolve(event.data);
      }, false);
      this._worker.postMessage(instruction);
    });
  }
  _replaceHandlebars(template, data) {
    const regex = /{{(.*?)}}/g;
    return template.replace(regex, (match, variableName) => {
      return data.hasOwnProperty(variableName) ? data[variableName].toString() : "";
    });
  }
  _getPostProcessingTime(text) {
    const match = text.match(/(\d+\.\d+)\s*seconds/);
    return match ? parseFloat(match[1]) : 0;
  }
};
export {
  AsyncOxigraph,
  RDFMimetype,
  ResponseMimetype,
  TaskType
};
