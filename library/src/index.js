"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.AsyncOxigraph = void 0;
var interfaces_1 = require("./interfaces");
/**
 * Async Oxigraph is a wrapper on top of Oxigraph that allows you to run an oxigraph instance
 * as a worker process and thereby you will not block your browser's main thread while doing
 * heavy operations like loading triples into an Oxigraph store.
 *
 * Developed by Mads Holten Rasmussen
 */
var AsyncOxigraph = /** @class */ (function () {
    function AsyncOxigraph(workerPath) {
        this.worker = new Worker(workerPath);
    }
    /**
     *
     * @param wasmPath path to the webassembly file relative to the path where the worker.js file is located
     * @returns a worker result with a message
     */
    AsyncOxigraph.prototype.init = function (wasmPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runBackgroundTask({ task: interfaces_1.TaskType.INIT, initPayload: { wasmPath: wasmPath } })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *
     * @param triples a string containing the RDF triples in a serialization according to the provided mimetype
     * @param mimetype describes the RDF serialization. Supported options are text/turtle, application/trig, application/n-triples, application/n-quads and application/rdf+xml
     * @param baseURI optionally describes the base namespace
     * @param graphURI optionally describes a named graph in which the triples should be loaded. Default is the main graph
     * @returns
     */
    AsyncOxigraph.prototype.load = function (triples, mimetype, baseURI, graphURI) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runBackgroundTask({ task: interfaces_1.TaskType.LOAD, loadPayload: { triples: triples, mimetype: mimetype, baseURI: baseURI, graphURI: graphURI } })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AsyncOxigraph.prototype.query = function (query, responseMimetype) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.runBackgroundTask({ task: interfaces_1.TaskType.QUERY, queryPayload: { query: query, responseMimetype: responseMimetype } })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AsyncOxigraph.prototype.close = function () {
        this.worker.terminate();
    };
    AsyncOxigraph.prototype.runBackgroundTask = function (instruction) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // Resolve result
                        _this.worker.addEventListener('message', function (event) {
                            if (event.data.error != undefined)
                                reject(event.data.error);
                            resolve(event.data);
                        }, false);
                        _this.worker.postMessage(instruction); // Send data to our worker.
                    })];
            });
        });
    };
    return AsyncOxigraph;
}());
exports.AsyncOxigraph = AsyncOxigraph;
