var wiki = require('./wiki.js');
var rawData = require('./data.raw.js');


function process(data) {
    return data
	.map(function (datum) {
	    return {
		name: datum.page,
		allies: wiki.parseLinks(datum.allies || ''),
		opponents: wiki.parseLinks(datum.opponents || ''),
		partof: wiki.parseLinks(datum.partof || '')
	    };
	});
}

console.log(process(rawData));
