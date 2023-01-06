let store;

importScripts('./scripts.worker.js');
self.addEventListener('message', async (ev) => {

    // Input
    const task = ev.data.task;

    let result = {
        task,
        message: ""
    };
    try{
        switch(task){
            case "INIT":
                result = await init(ev.data.initPayload, result);
                break;
            case "LOAD":
                result = await load(ev.data.loadPayload, result);
                break;
            case "QUERY":
                result = await query(ev.data.queryPayload, result);
                break;
        }
    }catch(err){
        result.error = err;
    }
    
    self.postMessage(result);

}, false);

// Init oxigraph
async function init(payload, result){
    // Per default, it expects the wasm file to be in the same folder
    const wasmPath = payload.wasmPath ?? "./web_bg.wasm";
    await scripts.oxigraph.default(wasmPath);
    result.message = "Initialized Oxigraph";
    return result;
}

// Load data
async function load(payload, result){

    // Create store if none exists
    if(store == undefined) store = new scripts.oxigraph.Store();

    const t1 = new Date();
    const s1 = store.size;

    await store.load(payload.triples, payload.mimetype, payload.baseURI, payload.graphURI);

    const t2 = new Date();
    const s2 = store.size;

    const count = s2-s1;
    const timeInSeconds = Math.abs(t2 - t1) / 1000;

    result.data = store.size;
    result.message = `Loaded ${count} triples in ${timeInSeconds} seconds`;
    return result;
    
}

// Query
async function query(payload, result){

    // Create store if none exists
    if(store == undefined){
        result.message = "No store available - nothing to query.";
        return result;
    };

    const queryDetails = getQueryDetails(payload.query);
    const type = queryDetails.type;

    const t1 = new Date();

    let results;
    if(type == "update"){
        const s1 = store.size;
        store.update(payload.query);
        const s2 = store.size;
        results = s2-s1;
    }
    else if(type == "query"){
        results = store.query(payload.query);
    }else{
        result.message = "Unknown query type.";
        return result;
    }
    
    const t2 = new Date();

    const timeInSeconds = Math.abs(t2 - t1) / 1000;

    if(type == "update"){
        result.data = {difference: results};
        result.message = results > 0 
            ? `Added ${results} triples to the store in ${timeInSeconds} seconds.`
            : `Removed ${Math.abs(results)} triples from the store in ${timeInSeconds} seconds.`;
        if(results == 0) result.message = `Nothing was added. Operation took ${timeInSeconds} seconds.`;
    }
    else if(type == "query"){
        const t3 = new Date();
        const [res, resultCount] = processQueryResponse(results, queryDetails, payload.responseMimetype);
        result.data = res;
        const t4 = new Date();

        const postProcessingTimeInSeconds = Math.abs(t4 - t3) / 1000;
        result.message = `Got ${resultCount} results in ${timeInSeconds} seconds. Post processing took ${postProcessingTimeInSeconds} seconds.`;
    }

    return result;
    
}

function getQueryDetails(query){
    const parser = new scripts.sparqljs.Parser();
    try{
        return parser.parse(query);
    }catch(err){
        if(err.toString().indexOf("SPARQL*") != -1){
            return {
                type: "query",
                queryType: "CONSTRUCT",
                sparqlStar: true
            }
        }else{
            throw err;
        }
    }
}

function processQueryResponse(results, queryDetails, mimetype){
    switch(queryDetails.queryType){
        case "SELECT":
            const variables = getSelectQueryVariables(queryDetails);
            return buildSelectQueryResponse(results, variables);
        case "ASK":
            return buildAskQueryResponse(results);
        case "CONSTRUCT":
            return buildConstructQueryResponse(results, mimetype, queryDetails.sparqlStar);
    }
}

function buildAskQueryResponse(result){
    return [result, 1];
}

function buildConstructQueryResponse(quads, mimetype, sparqlStar){
    let qRes = quads;
    if(mimetype == undefined || mimetype == "text/turtle"){
        const tempStore = new scripts.oxigraph.Store(quads);
        qRes = tempStore.dump("text/turtle", undefined);
    }else if(mimetype == "application/ld+json"){
        if(sparqlStar) throw"SPARQL* not supported for JSON-LD";
        let arr = [];
        for(let quad of quads){
            arr.push(quadToJSONLDObject(quad));
        }
        qRes = arr;
    }
    return [qRes, quads.length];
}

function buildSelectQueryResponse(bindings, variables){
    let doc = {
        head: {vars: variables},
        results: {bindings: []}
    }
    let termTypeMap = {
        NamedNode: "uri",
        Literal: "literal"
    }
    let resultCount = 0;
    for (const binding of bindings) {
        resultCount++;
        let obj = {};
        variables.forEach(variable => {
            obj[variable] = {};
            const node = binding.get(variable);
            obj[variable].value = node.value;
            obj[variable].type = termTypeMap[node.termType];
            if(obj[variable].type == "literal"){
                if(node.language != ""){
                    obj[variable]["xml:lang"] = node.language;
                }else{
                    obj[variable].datatype = node.datatype.value;
                }
            }
        });
        doc.results.bindings.push(obj);
    }
    return [doc, resultCount];
}

function getSelectQueryVariables(queryDetails){

    // If no wildcard
    if(queryDetails.variables[0].value != "*"){
        return queryDetails.variables.map(v => v.value);
    }

    // If wildcard
    let variables = new Set();
    queryDetails.where.forEach(item => {
        if(Object.keys(item).includes("triples")){
            item.triples.forEach(triple => {
                Object.keys(triple).forEach(key => {
                    if(triple[key].termType == "Variable") variables.add(triple[key].value);
                })
            })
        }
    })
    return Array.from(variables);
}

function quadToJSONLDObject(quad){
    let obj = {"@id": quad.subject.value};
    if(quad.predicate.value == "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"){
        obj["@type"] = quad.object.value;
    }else{
        if(quad.object.termType == "NamedNode"){
            obj[quad.predicate.value] = {"@id": quad.object.value};
        }else if(quad.object.termType == "Literal"){
            if(quad.object.datatype.value == "http://www.w3.org/2001/XMLSchema#string"){
                obj[quad.predicate.value] = quad.object.value;
            }
            if(quad.object.datatype.value == "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString"){
                obj[quad.predicate.value] = {
                    "@value": quad.object.value,
                    "@language": quad.object.language
                };
            }else{
                obj[quad.predicate.value] = {
                    "@value": quad.object.value,
                    "@type": quad.object.datatype.value
                }
            }
        }else{
            console.log("Unsupported object");
            console.log(quad);
        }
    }
    return obj;
}