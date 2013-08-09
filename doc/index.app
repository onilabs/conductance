var {Map, Computed, Observable, ObservableArray} = require('mho:observable');
var {RequireStyle, OnClick, Class, Mechanism, Widget, prependWidget, removeElement, appendWidget, Style, withWidget} = require('mho:surface');
var {Bootstrap} = require('mho:surface/bootstrap');
var seq = require('sjs:sequence');
var {map, indexed, find, each, join } = seq;
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
var Library = require('./library');
var {Symbol, MissingLibrary} = require('./symbol');

exports.run = function() {
	var libraries = Library.Collection();

	var locationHash = Observable("");

	var currentSymbol = Computed(locationHash, libraries.val, function(h) {
		logging.debug("Location hash: #{h}");
		if (!h) return null;
		var match = /^(.*?[^:]*)(::.*)?$/.exec(h);
		assert.ok(match, "Invalid path: #{h}");
		var [_, moduleUrl, symbolPath] = match;
		symbolPath = symbolPath ? symbolPath.slice(2).split('::') : [];
		console.log("moduleUrl", moduleUrl);
		console.log("symbolPath", symbolPath);

		try {
			var [library, modulePath] = libraries.resolveModule(moduleUrl);
		} catch(e) {
			if (!e instanceof Library.LibraryMissing) throw e;
			return new MissingLibrary(e.url, symbolPath);
		}

		return new Symbol(library, modulePath, symbolPath);
	});

	var breadcrumbs = Computed(currentSymbol, function(sym) {
		var ret = [];
		var prefix = '#';
		var sep = Widget("span", ` &raquo; `);
		if (sym) {
			ret = sym.parentLinks().slice(0, -1) .. map([href, name] -> Widget("a", name, {href: prefix + href}));
		}
		return Widget("div", ret .. seq.intersperse(sep), {"class":"breadcrumbs"});
	});

	var symbolDocs = Computed(currentSymbol, function(sym) {
		return sym ? ui.renderDocs(sym);
	});

	libraries.add('sjs:');
	libraries.add('mho:');

	var loadingText = ui.LOADING .. Computed(l -> "#{l} item#{l != 1 ? "s" : ""}");
	var loadingWidget = Widget("div", `Loading ${loadingText}...`)
			.. Class("loading")
			.. Class("hidden", Computed(ui.LOADING, l -> l == 0));

	var hubDebug = Computed(libraries.val, function(hubs) {
		return JSON.stringify(hubs, null, '  ');
	});
	var hubDisplay = Widget("pre", hubDebug);

	var FORWARD_SLASH = 47;
	var searchWidget = Widget("div", `
			<div class="searchTrigger">
				<button class="btn search"><i class="icon-search"></i></button>
			</div>`)
		.. Style("{ position: relative; top:1.1em}")
		.. Mechanism(function(elem) {
			var btn = elem.querySelector("button");

			using (var searchClick = btn .. events.HostEmitter('click')) {
				using (var searchShortcut = document.body .. events.HostEmitter('keypress', e -> e.which == FORWARD_SLASH)) {
					while(true) {
						waitfor {
							searchShortcut.wait();
						} or {
							searchClick.wait();
						}
						btn.parentNode.classList.add('hidden');
						try {
							var newLocation = require('./search').run(elem, libraries);
							if (newLocation) {
								document.location.hash = newLocation;
							}
						} finally {
							btn.parentNode.classList.remove('hidden');
						}
					}
				}
			}
		});
	
	var mainDisplay = Widget('div') .. Mechanism(function(elem) {
		using (var hashChange = events.HostEmitter(window, 'hashchange')) {
			while(true) {
				locationHash.set(document.location.hash.slice(1));
				hashChange.wait();
			}
		}
	});

	var root = document.body .. appendWidget(Widget("div", `
		<div class="header navbar-inner">
			$searchWidget
			<h1>Documentation Browser</h1>
		</div>
		$mainDisplay
		$breadcrumbs
		$symbolDocs
		$loadingWidget
	`)
	.. Bootstrap()
	.. Class("navbar navbar-inverted")
	.. RequireStyle(Url.normalize('main.css', module.id)));


};

exports.run();
