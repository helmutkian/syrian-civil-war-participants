var data = require('./data.proc.js');

function processLinks(data) {
    var nodeMap = {};

    data.forEach(function (node, i) {
	nodeMap[node.name] = { index: i };
    });

    return data
	.map(function (node) {
	    var support = (node.allies || []).concat(node.partof || []);
	    var hostile = node.opponents || [];
	    return createEdges(node, support, 1).concat(createEdges(node, hostile, -1));
	})
	.reduce(function (allEdges, edges) {
	    return allEdges.concat(edges);
	}, []);

    function createEdges(node, relations, type) {
	return relations
	    .filter(function (relation) {
		return nodeMap[relation] &&
		    !(nodeMap[relation][node.name] || nodeMap[node.name][relation]);
	    })
	    .map(function (relation) {
		nodeMap[node.name][relation] = true;
		return {
		    source: nodeMap[node.name].index,
		    target: nodeMap[relation].index,
		    type: type
		};
	    }); 
    }
}

console.log(processLinks(data));
