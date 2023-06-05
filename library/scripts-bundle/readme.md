# Oxigraph bundle

This is an Oxigraph bundle that will run in a web worker.

## Build new release

1. Run `npm run build`
1. In `scripts.bundle.js` add `init: init` to the `var web = /*#__PURE__*/Object.freeze(` list:

    Example
    ```js
    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        BlankNode: BlankNode,
        DefaultGraph: DefaultGraph,
        Literal: Literal,
        NamedNode: NamedNode,
        Quad: Quad,
        Store: Store,
        Variable: Variable,
        blankNode: blankNode,
        default: init,
        defaultGraph: defaultGraph,
        fromQuad: fromQuad,
        fromTerm: fromTerm,
        initSync: initSync,
        init: init, // Added manually
        literal: literal,
        main: main,
        namedNode: namedNode,
        quad: quad,
        triple: triple,
        variable: variable
    });
    ```

1. Now Oxigraph can be used in a web worker

## Example use

worker.js
```js
importScripts('./scripts.bundle.js');
self.addEventListener('message', async (ev) => {

    // Input
    const nquads = ev.data;

    // Init oxigraph
    await OX.oxigraph.init("../oxigraph/web_bg.wasm");

    // Create store and load data
    const store = new OX.oxigraph.Store();
    nquads.forEach(nq => store.load(nq, "application/n-triples"));

    // Get all rabbits
    const query = "SELECT * WHERE { ?rabbit a <http://ex#Rabbit>}";
    const results = [];
    for (const binding of store.query(query)) {
        results.push(binding.get("rabbit").value);
    }

    self.postMessage(results);

}, false);
```

app.js
```js
async function getRabbits(nquads){
    return new Promise(resolve => {
        const worker = new Worker('./worker.js');
        worker.addEventListener('message', (event) => {
            resolve(event.data);
        }, false);
        worker.postMessage(nquads);
    })
}
```