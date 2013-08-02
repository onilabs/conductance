var {Map, Computed, Observable, ObservableArray} = require('mho:observable');
var {RequireStyle, OnClick, Class, Mechanism, Widget, prependWidget, removeElement, appendWidget, Style, withWidget} = require('mho:surface');
var {Bootstrap} = require('mho:surface/bootstrap');
var seq = require('sjs:sequence');
var {map, indexed, find, each} = seq;
var array = require('sjs:array');
var events = require('sjs:events');
var cutil = require('sjs:cutil');
var str = require('sjs:string');
var {ownPropertyPairs, ownValues, hasOwn} = require('sjs:object');
var logging = require('sjs:logging');
var http = require('sjs:http');
var Url = require('sjs:url');

var assert = require('sjs:assert');
logging.setLevel(logging.DEBUG);

var ui = require('./ui');
var library = require('./library');

exports.run = function() {

	// TODO
	var viewPath = Observable(['sjs:', 'sequence']);

	var libraries = library.Collection();

	var currentSymbol = Computed(viewPath, function(path, libraries) {
		if (path.length == 0) {
			return undefined;
		}
		var lib = libraries.get(path[0]);

		ui.LOADING.block { ||
			lib.loadIndex();
			return lib.lookup(path.slice(1));
		}
	});

	libraries.add('sjs:');
	libraries.add('mho:');

	var loadingWidget = Widget("div", `Loading ${ui.LOADING} items...`)
			.. Class("loading")
			.. Class("hidden", Computed(ui.LOADING, l -> l == 0));

	var hubDebug = Computed(libraries.val, function(hubs) {
		return JSON.stringify(hubs, null, '  ');
	});
	var hubDisplay = Widget("pre", hubDebug);

	var searchWidget = Widget("div", `
			<div class="searchTrigger">
				<button class="btn search"><i class="icon-search"></i></button>
			</div>`)
		.. Style("{ position: relative; top:1.1em}")
		.. Mechanism(function(elem) {
			var btn = elem.querySelector("button");

			using (var searchClick = btn .. events.HostEmitter('click')) {
				using (var searchShortcut = document.body .. events.HostEmitter('keypress', e -> e.which == 47)) {
					while(true) {
						waitfor {
							searchShortcut.wait();
						} or {
							searchClick.wait();
						}
						btn.parentNode.classList.add('hidden');
						try {
							var newLocation = require('./search').show(elem, libraries);
						} finally {
							btn.parentNode.classList.remove('hidden');
						}
					}
				}
			}
		});

	var root = document.body .. appendWidget(Widget("div", `
		<div class="header navbar-inner">
			$searchWidget
			<h1>Documentation Browser</h1>
		</div>
		$loadingWidget
	`)
	.. Bootstrap()
	.. Class("navbar navbar-inverted")
	.. RequireStyle(Url.normalize('main.css', module.id)));


};

exports.run();
