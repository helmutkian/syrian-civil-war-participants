
function parse(content, states, fail) {
    var state = 0;
    var i = 0;
    var fsm = {
	peek: peek,
	readNext: readNext,
	changeState: changeState,
	skipWhitespace: skipWhitespace,
	isWhitespace: isWhitespace,
	isAnyOf: isAnyOf
    };

    while (state >= 0 && state < states.length) {
	if (i >= content.length) {
	    if (fail) fail();
	    break;
	}
	states[state](fsm);
    }

    function peek(step) {
	var n = step === undefined ? 1 : step;
	return content.slice(i, i + n);
    }

    function readNext(step) {
	var n = step === undefined ? 1 : step;
	var c = content.slice(i, i + n);

	i += n;

	return c;
    }

    function changeState(s) {
	state = s === undefined ? state + 1 : s;
    }

    function skipWhitespace() { 
	while (true) {
	    if (isWhitespace(peek())) {
		readNext();
	    } else {
		break;
	    }
	}      
    }
    
    function isWhitespace(c) {
	return isAnyOf(' \t\n\r\v', c);
    }

    function isAnyOf(chars, c) {
	return chars.indexOf(c) > -1;
    }
}

module.exports = parse;

