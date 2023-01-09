# Async Oxigraph
An asynchronous worker based approach to running [Oxigraph](https://www.npmjs.com/package/oxigraph) in a non-blocking fashion.

[Demo](https://LBD-Hackers.github.io/async-oxigraph/demo/)

Further, the library performs post processing so SELECT query results are returned in [SPARQL 1.1 Query Results JSON Format](https://www.w3.org/TR/sparql11-results-json/) and CONSTRUCT query results are returned either as JSON-LD or Turtle.

Better documentation will come! For now, check the demo source code in `demo/index.html`;

## Overview

* *demo* demonstrates how the library is used
* *library* contains the source code of *async-oxigraph*
   * *scripts-bundle* contains a bundled version of [Oxigraph's](https://www.npmjs.com/package/oxigraph) web version and the [sparqljs](https://www.npmjs.com/package/sparqljs) SPARQL to JSON translator.
   * *src* contains the minimal source code that basically translates instructions into Worker messages and returns responses as promises for easier use in a JavaScript project.

## Use

**NB!** not on npm yet
`npm i --save async-oxigraph`

Copy `worker.js`, `scripts.bundle.js` and `web_bg.wasm` to your assets folder.

```javascript
import { AsyncOxigraph } from 'async-oxigraph';

(async function () {
    
    const ao = new AsyncOxigraph("./path-to/worker.js");

    await ao.init("./path-to-wasm-relative-to-worker.wasm"); // Default is same folder as worker.js

    // Load data in background
    const loadResponse = await ao.load(triples, mimetype, baseURI, graphURI);

    // Query (responseMimetype only used for construct)
    const queryResponse = await ao.query(query, responseMimetype);

})();
```

But really, take a look at the demo :)

### Backlog

#### Top priority
1. Publish async-oxigraph library on npm
1. Write proper documentation

#### Other
1. Support for SPARQL* in JSON-LD response of CONSTRUCT query