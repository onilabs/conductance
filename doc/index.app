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
var Symbol = require('./symbol');

exports.run = function() {
	var libraries = Library.Collection();

	var locationHash = Observable(undefined);

	var currentSymbol = Computed(locationHash, libraries.val, function(h) {
		logging.debug("Location hash: #{h}");
		if (h === undefined) return undefined; // undefined: "not yet loaded"
		if (!h) return null;                   // null: "no symbol selected"
		return Symbol.resolveLink(h, libraries);
	});

	var breadcrumbs = Computed(currentSymbol, function(sym) {
		var ret = [];
		var prefix = '#';
		var sep = Widget("span", ` &raquo; `, {"class": "sep"});
		if (sym) {
			ret = sym.parentLinks().slice(0, -1) .. map([href, name] -> Widget("a", name, {href: prefix + href}));
			ret.push(Widget('span', sym.name, {"class":"leaf"}));
		}
		return Widget("div", ret .. seq.intersperse(sep), {"class":"breadcrumbs"});
	});

	var renderer = ui.renderer(libraries);
	var symbolDocs = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer(sym);
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
		.. Class("searchContainer")
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
	
	var mainDisplay = Widget('div', symbolDocs, {"class":"mb-main mb-top"}) .. RequireStyle(Url.normalize("./docs.css")) .. Mechanism(function(elem) {
		using (var hashChange = events.HostEmitter(window, 'hashchange')) {
			while(true) {
				locationHash.set(document.location.hash.slice(1));
				hashChange.wait();
			}
		}
	});

	document.body .. appendWidget(Widget("div", `
		<div class="header navbar-inner">
			$searchWidget
			<h1>Conductance documentation</h1>
		</div>
		$breadcrumbs
		$mainDisplay
		$loadingWidget
	`)
	.. Bootstrap()
	.. Class("navbar navbar-inverted")
	.. RequireStyle(Url.normalize('main.css', module.id))
	);
};


exports.main = function() {
	// wraps `run` with error handling
	var error = cutil.Condition();
	window.onerror = function(e) {
		error.set(e);
	};

	waitfor {
		var e = error.wait();
		logging.error(String(e));
		ui.withOverlay("error") {|bg|
			document.body .. withWidget(Widget("div",
				`<h1>:-(</h1>
				<h3>There was an error: </h3>
						<pre>${e.toString()}</pre>
				<p>You shouldn't have seen this error; please report to info@onilabs.com.</p>
				<p>
					To try again, reload the page or start over:
				</p>
				<p>
					<button class="reload">Reload page</button>
					<button class="restart">Start over</button>
				</p>
			`, {"class":"error-contents"})) {|elem|
				window.scrollTo(0,0);
				waitfor {
					elem.querySelector('button.reload') .. events.wait('click');
				} or {
					elem.querySelector('button.restart') .. events.wait('click');
					document.location.hash = "";
				}
			}
		}
		document.location.reload();
	} and {
		try {
			exports.run();
		} catch(e) {
			error.set(e);
		}
	}
};

exports.main();
