export function getSelectQueryVariables(queryDetails){

    // If no wildcard
    if(queryDetails.variables[0].value != "*"){
        return queryDetails.variables.map(v => v.value);
    }

    // If wildcard we need to traverse the query in order to find the variables
    let variables= new Set();
    searchDeeper(queryDetails.where, variables);

    // COULD ALSO GET IT DIRECTLY FROM QUERY
    // let variables= new Set();
    // query.split("?").splice(1)
    //     .map(item => item.trim().split(/[^A-Za-z]/)[0])
    //     .forEach(item => variables.add(item));
    // return Array.from(variables);

    return Array.from(variables);
}

function searchDeeper(item, variables){
    if(Array.isArray(item)){
        item.forEach(x => searchDeeper(x, variables));
    }else{
        if(item.type == "bgp"){
            item.triples.forEach(quad => {
                processQuad(quad, variables);
            })
        }else if(item.type == "optional"){
            searchDeeper(item.patterns, variables);
        }else if(item.type == "bind"){
            variables.add(item.variable.value);
        }else if(item.type == "values"){
            Object.keys(item.values[0]).forEach(v => variables.add(v.split("?")[1]));
        }
    }
}

function processQuad(quad, variables){
    Object.keys(quad).forEach(key => {
        if(quad[key].termType == "Variable") variables.add(quad[key].value);

        // In SPARQL* the spo can all be quads themselves, and then we need to go one step deeper
        else if(quad[key].termType == "Quad") processQuad(quad[key], variables);
    })
}