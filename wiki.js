var request = require('request');
var Q = require('q');
var parse = require('./parse.js');

function getWiki(page) {
    var deferred = Q.defer();
    var params = {
	action: 'query',
	titles: page,
	prop: 'revisions',
	rvprop: 'content',
	format: 'json',
	continue: '',
	rvlimit: 1
    };
    
    request({
	url: 'http://en.wikipedia.org/w/api.php',
	qs: params,
	json: true
    }, function (err, msg, data) {
	if (err) {
	    deferred.reject(err);
	} else {
          try {
	    var content = getContent(data);
	    var infobox = parseInfobox(content);
	    if (infobox) {
		deferred.resolve(infobox);
	    } else {
		deferred.reject(new Error(page + ' : Cannot find/parse infobox'));
	    }
          } catch (ex) {
            deferred.reject(page + ' : ' + ex);
          }
	}
    });

    return deferred.promise;
}

function getContent(data) {
    return Object.keys(data.query.pages)
	.reduce(function (content, key) {
	    return data.query.pages[key].revisions[0]['*'];
	}, null);
}

function parseInfobox(content) {
    var bracketCount = 0;
    var infobox = {};
    var acc = '';
    var prop = '';

    parse(content, [
	state0,
	state1,
	state2,
	state3,
	state4
    ], function () {
	infobox = null;
    });

    return infobox;

    function state0(fsm) {
	var c = fsm.peek(2);

	if ('{{' === c) {
	    fsm.readNext(2);
	    fsm.skipWhitespace();
	    fsm.changeState();
	} else {
	    fsm.readNext();
	}
    }

    function state1(fsm) {
	var c = fsm.peek(7);

	if ('infobox' === c.toLowerCase()) {
	    fsm.readNext(7);
	    fsm.changeState();
	} else {
	    fsm.changeState(0);
	}
    }

    function state2(fsm) {
	var c = fsm.readNext();

	if ('|' === c) {
	    if (acc) {
		infobox.tags = (infobox.tags || []).concat([acc]);
		acc = '';
	    }
	    fsm.skipWhitespace();
	    fsm.changeState();
	} else if (!fsm.isWhitespace(c)) {	
	    acc += c;
	} else if (acc) {
	    infobox.tags = (infobox.tags || []).concat([acc]);
	    acc = '';
	}
    }

    function state3(fsm) {
	var c = fsm.readNext();

	if ('=' === c) {
	    prop = acc.trim();
	    acc = '';
	    fsm.skipWhitespace();
	    fsm.changeState();
	} else {
	    acc += c;
	}
    }

    function state4(fsm) {
	var c = fsm.readNext();

	if ('}' === c && bracketCount == 0) {
	    infobox[prop] = acc;
	    acc = '';
	    fsm.changeState();
	} else if ('|' == c && bracketCount == 0) {
	    infobox[prop] = acc;
	    acc = '';
	    fsm.skipWhitespace();
	    fsm.changeState(3);
	} else if (fsm.isAnyOf('}])>', c)) {
	    bracketCount--;
	    acc += c;
	} else if (fsm.isAnyOf('{[(<', c)) {
	    bracketCount++;
	    acc += c;
	} else {
	    acc += c;
	}
    }
}

function parseLinks(infoboxProp) {
    var regex = /\[\[([^\[\]]+)(?:\|([^\[\]]+))?\]\]/g;
    return (infoboxProp
	    .match(regex)
          || [])
	.map(function (s) {
	    var len = s.length;
	    return s.slice(2,len - 2).split('|')[0];
	});
}

module.exports.getWiki = getWiki;
module.exports.parseLinks = parseLinks;
