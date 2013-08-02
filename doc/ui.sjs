var {Widget, Style, prependWidget, removeElement} = require('mho:surface');
var {Observable} = require('mho:observable');

var events = require('sjs:events');

var ESCAPE = exports.ESCAPE = 27;
var RETURN = exports.RETURN = 13;

var withOverlay = exports.withOverlay = (function() {
	var overlay = Widget("div") .. Style('{
		position: fixed;
		left:0;
		top:0;
		bottom: 0;
		right:0;
		background-color: #222;
		opacity: 0.7;
	}');

	return function(block) {
		var elem = document.body .. prependWidget(overlay);
		try {
			waitfor {
				return block(elem);
			} or {
				elem .. events.wait('click', e -> e.target === elem);
			} or {
				document.body .. events.wait('keydown', e -> e.which == ESCAPE);
			}
		} finally {
			removeElement(elem);
		}
	};
})();


var LOADING = exports.LOADING = Observable(0);
LOADING.inc = -> LOADING.set(LOADING.get()+1);
LOADING.dec = -> LOADING.set(LOADING.get()-1);
LOADING.block = function(b) {
	waitfor {
		return b();
	} or {
		// this branch never taken if result is synchronous
		LOADING.inc();
		try {
			hold();
		} finally {
			LOADING.dec();
		}
	}
};
