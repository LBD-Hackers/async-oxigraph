"use strict";
exports.__esModule = true;
exports.RDFMimetype = exports.ResponseMimetype = exports.TaskType = void 0;
var TaskType;
(function (TaskType) {
    TaskType["INIT"] = "INIT";
    TaskType["LOAD"] = "LOAD";
    TaskType["QUERY"] = "QUERY";
})(TaskType = exports.TaskType || (exports.TaskType = {}));
// Only for CONSTRUCT queries
// SELECT queries are always returned as [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/)
var ResponseMimetype;
(function (ResponseMimetype) {
    ResponseMimetype["JSONLD"] = "application/ld+json";
    ResponseMimetype["TURTLE"] = "text/turtle";
})(ResponseMimetype = exports.ResponseMimetype || (exports.ResponseMimetype = {}));
var RDFMimetype;
(function (RDFMimetype) {
    RDFMimetype["TURTLE"] = "text/turtle";
    RDFMimetype["NTRIPLES"] = "application/n-triples";
    RDFMimetype["NQUADS"] = "application/n-quads";
    RDFMimetype["RDFXML"] = "application/rdf+xml";
})(RDFMimetype = exports.RDFMimetype || (exports.RDFMimetype = {}));
