// 3rd party scripts
export * as oxigraph from 'oxigraph/web.js';
import { Parser } from 'sparqljs';
import { Store } from 'oxigraph/web.js';
import { getSelectQueryVariables } from './sparql-processing';

// Other scripts that will be part of the bundle

/**
 * Takes a SPARQL query and returns its content in JSON format
 * @param {*} query the SPARQL query
 * @returns 
 */
export function getQueryDetails(query: string){
    const parser = new Parser({sparqlStar: true});
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
            throw "Couldn't get query details: " + err.toString();
        }
    }
}

/**
 * Processes a query response as returned by Oxigraph so it's easier to work with in a JavaScript
 * based application
 * @param {*} results the raw Oxigraph results
 * @param {*} queryDetails Query details in JSON format as returned by the getQueryDetails method
 * @param {*} mimetype used for CONSTRUCT queries to describe the desired serialization of the results
 * @returns 
 */
export function processQueryResponse(results: any, queryDetails: any, mimetype: string){
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

function buildAskQueryResponse(result: boolean){
    return [result, 1];
}

function buildConstructQueryResponse(quads, mimetype: string, sparqlStar){
    let qRes = quads;
    if(mimetype == undefined || mimetype == "text/turtle"){
        const tempStore = new Store(quads);
        qRes = tempStore.dump("text/turtle", undefined);
    }else if(mimetype == "application/ld+json"){
        if(sparqlStar) throw "SPARQL* not supported for JSON-LD";
        let arr: any[] = [];
        for(let quad of quads){
            arr.push(quadToJSONLDObject(quad));
        }
        qRes = arr;
    }
    return [qRes, quads.length];
}

function buildSelectQueryResponse(results, variables){
    let bindings: any[] = [];
    let doc = {
        head: {vars: variables},
        results: {bindings}
    }
    let termTypeMap = {
        NamedNode: "uri",
        Literal: "literal"
    }
    let resultCount = 0;
    for (const result of results) {
        resultCount++;
        
        // Object to hold the new binding results
        let binding: any = {};

        variables.forEach(variable => {

            binding[variable] = {};

            let node;
            try{
                node = result.get(variable);
            }catch(err){
                console.log(err);
            }

            if(node != undefined){
                binding[variable].value = node.value;
                binding[variable].type = termTypeMap[node.termType];
                if(binding[variable].type == "literal"){
                    if(node.language != ""){
                        binding[variable]["xml:lang"] = node.language;
                    }else{
                        binding[variable].datatype = node.datatype.value;
                    }
                }
            }

        });
        bindings.push(binding);
    }
    return [doc, resultCount];
}

function quadToJSONLDObject(quad){
    console.log(quad);
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