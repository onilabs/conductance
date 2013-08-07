var {Map, Computed, Observable, ObservableArray} = require('mho:observable');
var {RequireStyle, Class, Mechanism, Widget, Style, withWidget} = require('mho:surface');
var seq = require('sjs:sequence');
var {map, indexed, find, each} = seq;
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
		obj .. ownPropertyPairs .. each {|[k,v]|
			var id = path + k;
			symbols.push([lib.name, id, k.type]);
			switch (v.type) {
				case 'directory':
					id += '/';
					break;
				case 'module':
				case 'class':
					id += "::";
					break;
				default:
					if (v.children) {
						logging.warn("I don't know what a #{v.type} is!");
					}
					break;
			}
			if (v.children) addSymbols(v.children, id);
		}
	};
	addSymbols(lib.loadIndex(), "");
	return symbols;
};


exports.run = (function() {
	var searchTerm = Observable();
	var lastQuery = null;

	return function(elem, libraries) {
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
							hold(50);
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
					using(var key = events.HostEmitter(input, 'keyup')) {
						while(true) {
							var e = key.wait();
							hold(0);
							//logging.debug('queueing query:', input.value);
							query.put(input.value.trim().toLowerCase());
						}
					}
				} or {
					using(var key = events.HostEmitter(input, 'keydown')) {
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
						var textBlock = [i, t] -> Widget(i % 2 ? "strong" : "span", t);
						var textWidgets = m.text .. indexed .. map(textBlock);
						var hubWidget = Widget('span', m.hub, {"class":"hub"});
						return Widget('li', [hubWidget].concat(textWidgets))
							.. Class("result result-#{m.type}")
							.. Class("selected", highlighted)
							.. Mechanism(function(elem) {
								waitfor {
									elem .. events.wait('click', -> done.set());
								} and {
									while (true) {
										elem .. events.wait('mouseover', -> selectedMatch.set(m.id));
									}
								}
							});
					});
					if (res.overflow) {
						rv.push(Widget("li", " ... ", {"class": "more"}));
					}
				} else {
					if (res.noResults) {
						rv.push(Widget("li", "No results found"));
					}
				}
				return Widget("ul", rv) .. Class("results") .. Class("empty", rv.length == 0);
			});

			libraries.get() .. ownValues .. each(function(lib) {
				var loaded = Observable("loading ...");
				// TODO: this never updates!
				libraryStatus.push(Widget("li", `${lib.name} ${loaded}`));

				spawn(function() {
					var idx = lib.loadIndex();
					if (idx === null) {
						loaded.set("Missing");
						return;
					}
					logging.debug("Added library #{lib.name} to index");
					index.set(
						// always keep index sorted by shortest-first
						index.get().concat(flattenLibraryIndex(lib))
							.. seq.sortBy(i -> i[1].length)
					);
					// TODO: observables embedded in widgets don't take their new value if they are updated too soon
					// event loop as their creation
					hold(50);
					loaded.set("Loaded");
				}());
			});

			var widget = Widget("div", `
				<input type="text" value="${lastQuery ? lastQuery}"></input>
				${resultWidget}
				<div style="background: #555; margin-top:50px;color: white; padding:10px;">
					library status:
					<ul>
						${libraryStatus}
					</ul>
				</div>
			`) .. Class("searchWidget") .. RequireStyle(Url.normalize('search.css', module.id));

			var changeSelected = function(offset, newIndex) {
				var res = results.get();
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

			elem .. withWidget(widget) {|elem|
				var input = elem.querySelector('input');
				input.focus();
				search(lastQuery, true);
				waitfor {
					searchWorker();
				} or {
					return inputWorker(input);
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
		var idLower = id.toLowerCase();
		var words = queryWords.slice();
		var parts = [];
		var next = function(offset) {
			var minimum = id.length;
			var word = null;
			words .. each {|w|
				var i = idLower.indexOf(w, offset);
				if (i == -1 && offset == 0) {
					// a word was not found, abort early
					return;
				}
				if (i != -1 && i < minimum) {
					minimum = i;
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
	//results = results .. seq.sortBy(r -> r.id.length);
	results.noResults = results.length == 0;
	return results;
}
