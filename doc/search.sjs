var {RequireExternalStyle, Class, Mechanism, Element, Style, appendContent, Checkbox, Attrib} = require('mho:surface');
var {Checkbox} = require('mho:surface/html');
var seq = require('sjs:sequence');
var {map, indexed, find, each, toArray, filter, transform, first} = seq;
var { ObservableVar, observe } = require('sjs:observable');
var event = require('sjs:event');
var dom = require('sjs:xbrowser/dom');
var cutil = require('sjs:cutil');
var {ownPropertyPairs, ownValues, hasOwn} = require('sjs:object');
var logging = require('sjs:logging');
var Url = require('sjs:url');
var http = require('sjs:http');

var assert = require('sjs:assert');

var ui = require('./ui');

var flattenLibraryIndex = function(lib) {
	var symbols = [];
	var addSymbols = function(obj, path) {
		if (!obj.children) return;
		obj.children .. ownPropertyPairs .. each {|[k,v]|
			var id = path + k;
			if (v.type == 'ctor') continue;
			symbols.push([lib.name, id, v.type]);
			switch (v.type) {
				case 'lib':
					break;
				case 'module':
				case 'class':
					id += "::";
					break;
				default:
					if (v.children > 0) {
						logging.warn("I don't know what a #{v.type} is!");
					}
					break;
			}
			addSymbols(v, id);
		}
	};
	addSymbols(lib.loadIndex(), "");
	return symbols;
};


exports.run = (function() {
	var searchTerm = ObservableVar();
	var lastQuery = null;

	return function(elem, libraries, onReady) {
		var done = cutil.Condition();

		return ui.withOverlay {||
			var libraryStatus = [];
			var index = ObservableVar([]);
			var query = cutil.Queue();
			var results = ObservableVar([]);
			var selectedMatch = ObservableVar(null);

			var search = function(query, force) {
				if (query == lastQuery && !force) return;
				if (query == null) return;
				lastQuery = query;

				var rv = searchIndex(query, index.get());
				if (lastQuery !== query) return; // this search has expired

				var selected = selectedMatch.get();

				// if we had something selected but now it's gone,
				// unset selectedMatch
				if (selected && ! rv .. seq.find(r -> r.id == selected, false)) {
					selectedMatch.set(null);
				}
				results.set(rv);
			};

			var searchWorker = function() {
				waitfor {
					index .. each( -> search(lastQuery, true));
				} or {
					var q = query.get();
					while(true) {
						waitfor {
							search(q);
							hold();
						} or {
							q = query.get();
						}
					}
				}
			};

			var inputWorker = function(input) {
				waitfor {
					event.events(input, 'input', {handle: dom.stopPropagation}) ..
            each {|e|
						  query.put(input.value.trim().toLowerCase());
					  };
				} or {
					var bindings = {
						'Down':     -> changeSelected(+1),
						'Up':       -> changeSelected(-1),
						'PageDown': -> changeSelected(0, results.get().length - 1),
						'PageUp':   -> changeSelected(0, 0),
					};

					// backfill for browsers that support neither key or keyIdentifier:
					var keycodes = {
						40: 'Down',
						38: 'Up',
						34: 'PageDown',
						33: 'PageUp',
					};

					event.events(input, 'keydown', {
						transform: e -> { which: e.which, key: keycodes[e.which] },
						filter: e -> e.which == ui.RETURN || (e.key && bindings .. hasOwn(e.key)),
						handle: dom.preventDefault,
					}) .. each {|e|
						if (e.which == ui.RETURN) {
							return highlightedMatch .. first();
						} else {
							bindings[e.key]();
						}
					}
				}
			};


			var highlightedMatch = observe(selectedMatch, results, function(sel, results) {
				if (sel) return sel;
				return results[0] && results[0].id;
			});

			var resultWidget = results .. transform(function(res) {
				var rv = [];
				if (res.length > 0) {
					rv = res.map(function(m) {
						var highlighted = highlightedMatch .. transform(h -> h == m.id);
						var textBlock = [i, t] -> i % 2 ? `<strong>$t</strong>` : `<span>$t</span>`;
						var textWidgets = m.text .. indexed .. map(textBlock);
						var hubWidget = `<span class="hub">${m.hub}</span>`;
						return Element('li', [hubWidget].concat(textWidgets))
							.. Class("result result-#{m.type}")
							.. Class("selected", highlighted)
							.. Mechanism(function(elem) {
								waitfor {
									elem .. event.wait('click');
									done.set();
								} and {
									while (true) {
										elem .. event.wait('mouseover');
										selectedMatch.set(m.id);
									}
								}
							});
					});
					if (res.overflow) {
						rv.push(`<li class="more"> ... </li>`);
					}
				} else { // rv.length == 0
					if (res.noResults) {
						rv.push(Element("li", "No results found"));
					}
				}
				rv.push([`<li class="sep">Search in:</li>`, libraryStatus]);
				return Element("ul", rv) .. Class("results") .. Class("empty", rv.length == 0);
			});

			var indexWithout = function(idx, lib) {
				return idx .. filter([name] -> name != lib.name);
			};
			var indexWith = function(idx, lib) {
				return idx
					.. indexWithout(lib)
					.. seq.concat(flattenLibraryIndex(lib))
						// always keep index sorted by shortest-first
					.. seq.sortBy(i -> i[1].length);
			};

			libraries.get() .. ownValues .. each {|lib|
				var loaded = ObservableVar("loading ...");
				var disabled = ObservableVar(false);
				var enabledWidget = Checkbox(lib.searchEnabled) .. Attrib("disabled", disabled);
				libraryStatus.push(Element("li", `${enabledWidget} <span class="hub">${lib.name}</span> ${loaded}`, {"class":"libraryStatus"}));
				spawn(function() {
					// load each index in background
					var idx = lib.loadIndex();
					if (idx === null) {
						loaded.set("No search index");
						disabled.set(true);
					} else {
						loaded.set("");
					}
				}());
			};

			var indexUpdate = function() {
				libraries.get() .. ownValues .. each.par {|lib|
					lib.loadIndex(); // wait until library is loaded
					lib.searchEnabled .. each {|val|
						if (val) {
							// add to index
							index.modify(current -> current .. indexWith(lib) .. toArray);
						} else {
							index.modify(current -> current .. indexWithout(lib) .. toArray);
						}
					}
				}
			};

			var widget = Element("div", `
				<input type="text" class='form-control' value="${lastQuery ? lastQuery}"></input>
				<a class="cancel">&times;</a>
				<div>
					${resultWidget}
				</div>
				</div>
			`) .. Class("searchWidget");

			var changeSelected = function(offset, newIndex) {
				var res = results.get();
        if (res.length === 0) return;
				if (newIndex === undefined) {
					// use offset
					var current = highlightedMatch .. first();
					var found = -1;
					for (var i=0; i<res.length; i++) {
						if (res[i].id == current) {
							found = i;
							break;
						}
					}
					newIndex = found + offset;
				}
				if (newIndex < 0) newIndex = 0;
				if (newIndex >= res.length) newIndex = res.length - 1;
        selectedMatch.set(res[newIndex].id);
			};

			elem .. appendContent(widget) {|elem|
				window.scrollTo(0,0);
				var input = elem.querySelector('input');
				input.select();
				if (onReady) onReady();
				search(lastQuery, true);
				waitfor {
					searchWorker();
				} or {
					return inputWorker(input);
				} or {
					indexUpdate(input);
				} or {
					elem.querySelector('.cancel') .. event.wait('click');
				} or {
					done.wait();
					return selectedMatch.get();
				}
			}
		}
	}
})();

/** perform a search on a given index.
 * Returns all matching items
 */
function searchIndex(query, index) {
	logging.debug("Searching: ", query);
	var results = [];
	if (query.length < 2) {
		return results;
	}

	var queryWords = query.split(/ +/)
		.. seq.filter()
		.. seq.sortBy(w -> w.length)
		.. seq.reverse();

	var count = 0;
	index .. each {|[hub, id, type]|
		if (results.length > 14) {
			results.overflow = true;
			break;
		}
		if (count++ % 100 == 0) hold(0); // keep UI responsive
		__js {
			var idLower = id.toLowerCase();
			var words = queryWords.slice();
			var parts = [];
			var next = function(offset) {
				var minimum = id.length;
				var word = null;
				for (var i=0; i<words.length; i++) {
					var w = words[i];
					var strpos = idLower.indexOf(w, offset);
					if (strpos == -1 && offset == 0) {
						// a word was not found, abort early
						return;
					}
					if (strpos != -1 && strpos < minimum) {
						minimum = strpos;
						word = w;
					}
				}
				if (word) {
					words.splice(words.indexOf(word), 1);
					parts.push(id.slice(offset, minimum));
					parts.push(id.slice(minimum, minimum + word.length));
					next(minimum + word.length);
				} else {
					parts.push(id.slice(offset));
				}
			};

			next(0);

			if (words.length == 0) {
				// all words found
				results.push({
					hub: hub,
					id: hub + id,
					type: type,
					text: parts,
				});
			}
		}
	}
	results.noResults = results.length == 0;
	return results;
}
