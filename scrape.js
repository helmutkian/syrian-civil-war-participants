var Q = require('q');
var wiki = require('./wiki.js');

var visitedPages = {};

function visitPage(page) {
    if (!visitedPages[page]) {
	visitedPages[page] = true;
	return wiki.getWiki(page)
	    .then(function (info) {
		info.page = page;
		console.log(info);
		console.log();
		return Q.all(getLinks(info).map(visitPage));
	    }, function (err) {
		//console.log(err);
	    });
    } else {
	return Q.when();
    }
}

function getLinks(info) {
    return wiki.parseLinks(
	(info.allies || '') +
	(info.opponents || '') +
	(isFaction(info) ? (info.partof || '') : '')
    );

    function isFaction(info) {
	return (info.tags || []).indexOf('faction') > -1;
    }
}

visitPage('Ahrar ash-Sham')
    .catch(function(e) {
	// console.log(e)
    })
    .done(function () {
	//console.log('::: DONE! :::');
    });
