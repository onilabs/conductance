var {Map, Computed, Observable, ObservableArray} = require('mho:observable');
var {RequireStyle, Class, Mechanism, Widget, Style, withWidget, Checkbox, Attrib} = require('mho:surface');
var {Checkbox} = require('mho:surface/html');
var seq = require('sjs:sequence');
var {map, indexed, find, each, toArray, filter} = seq;
var events = require('sjs:events');
var cutil = require('sjs:cutil');
var {ownPropertyPairs, ownValues} = require('sjs:object');
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
	var searchTerm = Observable();
	var lastQuery = null;

	return function(elem, libraries, onReady) {
		var done = cutil.Condition();

		return ui.withOverlay {||
			var libraryStatus = [];
			var index = ObservableArray([]);
			var query = cutil.Queue();
			var results = ObservableArray([]);
			var selectedMatch = Observable(null);

			var search = function(query, force) {
				if (query == lastQuery && !force) return;
				if (query == null) return;
				lastQuery = query;

				var rv = searchIndex(query, index.get());
				var selected = selectedMatch.get();

				// if we had something selected but now it's gone,
				// unset selectedMatch
				if (selected && ! rv .. seq.find(r -> r.id == selected)) {
					selectedMatch.set(null);
				}
				results.set(rv);
			};

			var searchWorker = function() {
				waitfor {
					index.observe( -> search(lastQuery, true));
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
					// keyup for entry (i.e after it's been pressed)
					using(var key = events.HostEmitter(input, ['keyup'])) {
						while(true) {
							var e = key.wait();
							hold(0);
							//logging.debug('queueing query:', input.value);
							query.put(input.value.trim().toLowerCase());
						}
					}
				} or {
					using(var key = events.HostEmitter(input, 'keydown', {handle:null})) {
						while(true) {
							var e = key.wait();
							//logging.debug("KEY", e);
							if (e.which == ui.RETURN) {
								return highlightedMatch.get();
							} else if (e.keyIdentifier == 'Down') {
								changeSelected(+1);
								e.preventDefault();
							} else if (e.keyIdentifier == 'Up') {
								changeSelected(-1);
								e.preventDefault();
							} else if (e.keyIdentifier == 'PageDown') {
								changeSelected(0, results.get().length - 1);
								e.preventDefault();
							} else if (e.keyIdentifier == 'PageUp') {
								changeSelected(0, 0);
								e.preventDefault();
							}
						}
					}
				}
			};


			var highlightedMatch = Computed(selectedMatch, results, function(sel, results) {
				if (sel) return sel;
				return results[0] && results[0].id;
			});

			var resultWidget = Computed(results, function(res) {
				var rv = [];
				if (res.length > 0) {
					rv = res.map(function(m) {
						var highlighted = Computed(highlightedMatch, h -> h == m.id);
						var textBlock = [i, t] -> i % 2 ? `<strong>$t</strong>` : `<span>$t</span>`;
						var textWidgets = m.text .. indexed .. map(textBlock);
						var hubWidget = `<span class="hub">${m.hub}</span>`;
						return Widget('li', [hubWidget].concat(textWidgets))
							.. Class("result result-#{m.type}")
							.. Class("selected", highlighted)
							.. Mechanism(function(elem) {
								waitfor {
									elem .. events.wait('click', {handle: -> done.set()});
								} and {
									while (true) {
										elem .. events.wait('mouseover', {handle:-> selectedMatch.set(m.id)});
									}
								}
							});
					});
					if (res.overflow) {
						rv.push(`<li class="more"> ... </li>`);
					}
				} else { // rv.length == 0
					if (res.noResults) {
						rv.push(Widget("li", "No results found"));
					}
				}
				rv.push([`<li class="sep">Search in:</li>`, libraryStatus]);
				return Widget("ul", rv) .. Class("results") .. Class("empty", rv.length == 0);
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
				var loaded = Observable("loading ...");
				var disabled = Observable(false);
				var enabledWidget = Checkbox(lib.searchEnabled) .. Attrib("disabled", disabled);
				libraryStatus.push(Widget("li", `${enabledWidget} <span class="hub">${lib.name}</span> ${loaded}`, {"class":"libraryStatus"}));
				var idx = lib.loadIndex();
				if (idx === null) {
					loaded.set("No search index");
					disabled.set(true);
				} else {
					if (lib.searchEnabled.get()) {
						logging.debug("Added library #{lib.name} to index");
						index.set(index.get() .. indexWith(lib) .. toArray);
					}
					loaded.set("");
				}
			};

			var indexUpdate = function() {
				libraries.get() .. ownValues .. each.par {|lib|
					lib.searchEnabled.observe {|val|
						if (val) {
							// add to index
							index.set(index.get() .. indexWith(lib) .. toArray);
						} else {
							index.set(index.get() .. indexWithout(lib) .. toArray);
						}
					}
				}
			};

			var widget = Widget("div", `
				<input type="text" value="${lastQuery ? lastQuery}"></input>
				<a class="reset" style="position:absolute; top:0; right:5px;">&#x2A2F;</a>
				${resultWidget}
				</div>
			`) .. Class("searchWidget");

			var changeSelected = function(offset, newIndex) {
				var res = results.get();
        if (res.length === 0) return;
				if (newIndex === undefined) {
					// use offset
					var current = highlightedMatch.get();
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

			var resetWorker = function(reset, input) {
				using(var click = reset .. events.HostEmitter('click')) {
					while(true) {
						click.wait();
						input.value = '';
						input.focus();
						search('');
					}
				}
			};

			elem .. withWidget(widget) {|elem|
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
					var reset = elem.querySelector('.reset');
					resetWorker(reset, input);
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
		if (count++ % 50 == 0) hold(0); // keep UI responsive
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
