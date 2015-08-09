var data = require('./data.proc.js');

function processNodes(data) {
  return data.map(function (node) { return { name: node.name }; });
}

console.log(processNodes(data));