var d3 = require('d3');

var height = 1000;
var width = 1800;

var svg = d3.select('#content')
	.append('svg')
	.attr('width', width)
	.attr('height', height);

var force = d3.layout.force()
	.size([width, height])
	.nodes(nodes)
	.links(links)
	.linkDistance(75)
	.charge(-500)
	.on('end', end);

var link = svg.selectAll('.link')
	.data(force.links())
	.enter().append('line')
	.attr('class', 'link')
	.style('stroke', function (d) { return d.type === 1 ? 'green' : 'red'; })
	.style('opacity', 0.6)
	.on('mouseover', function () {
	    d3.select(this).style('opacity', 1);
	})
	.on('mouseout', function () {
	    d3.select(this).style('opacity', 0.6);
	});

var node = svg.selectAll('.node')
	.data(force.nodes())
	.enter().append('g')
	.attr('class', 'node')
	.style('fill', 'blue')
	.on('mouseover', mouseover)
	.on('mouseout', mouseout);

node.append('circle')
    .attr('r', 5)
    .style('stroke', 'white')
    .style('stroke-width', '1.5px');


node.append('text')
    .attr('class', 'node-text')
    .attr('dx', 12)
    .attr('dy', '0.35em')
    .style('font-size', '10px')
    .style('opacity', 0)
    .text(function (d) { return d.name; })
    .style('pointer-events', 'none');


force.start();

function end() {
    link
	.attr("x1", function (d) { return d.source.x; })
	.attr("y1", function (d) { return d.source.y; })
	.attr("x2", function (d) { return d.target.x; })
	.attr("y2", function (d) { return d.target.y; });
    
    node
	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
}

function mouseover(d) {
    d3.select(this).select('circle').transition()
	.duration(750)
	.attr('r', 10);
    
    d3.select(this).select('text').transition()
	.duration(750)
	.attr('x', 13)
	.style('stroke-width', '1px')
	.style('opacity', 1)
	.style('fill', 'black')
	.style('font-weight', 'bold')
	.style('font-size', '14px');
    
    highlight(d);
}

function mouseout(d) {
    d3.select(this).select('circle').transition()
	.duration(750)
	.attr('r', 5);

    d3.select(this).select('text').transition()
	.duration(1250)
	.attr('x', 0)
	.style('opacity', 0)
	.style('fill', 'blue')
	.style('font-weight', 'normal')
	.style('font', '10px');
    
    unhighlight(d);
}


function highlight(selectedNode) {
    link
	.transition()
	.duration(750)
	.style('opacity', function (d) {
	    return isIncident(selectedNode, d) ?  0.8 : 0.2;
	})
	.style('stroke', function (d) {
	    return isIncident(selectedNode, d) ?
		(d.type === 1 ? 'green' : 'red') :
	        'grey';
	})
	.style('stroke-width', function (d) {
	    return isIncident(selectedNode, d) ? 1.5 : 1;
	});

    var adjacentNodes = node.filter(function (d) { return isAdjacent(selectedNode, d); });

    adjacentNodes.select('circle')
	.transition()
	.duration(750)
	.style('opacity', 0.6);

    adjacentNodes.select('text')
	.transition()
	.duration(750)
	.style('opacity', 0.8)
	.attr('x', 5);
    
    
    node
	.filter(function (d) {
	    return d !== selectedNode && !isAdjacent(selectedNode, d);
	})
	.transition()
	.duration(750)
	.style('opacity', 0.6)
	.style('fill', 'grey');
}

function unhighlight() {
    link
	.transition()
	.duration(750)
	.style('opacity', 0.6)
    	.style('stroke', function (d) { return d.type === 1 ? 'green' : 'red'; })
	.style('stroke-width', 1);

    node
	.transition()
	.duration(750)
	.style('opacity', 1)
	.style('fill', 'blue');

    node.select('text')
	.transition()
	.duration(750)
	.attr('x', 0)
	.style('opacity', 0);

}

function isAdjacent(a, b) {
    return links.some(function (d) {
	return (d.source === a && d.target === b) || (d.source === b && d.target == a);
    });
}

function isIncident(node, edge) {
    return node === edge.source || node === edge.target
}
