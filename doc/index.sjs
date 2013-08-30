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

var mainStyle   = RequireStyle(Url.normalize('css/main.css', module.id))
var docsStyle   = RequireStyle(Url.normalize('css/docs.css', module.id))
var searchStyle = RequireStyle(Url.normalize('css/search.css', module.id));

exports.run = function() {
	var libraries = Library.Collection();

	var locationHash = Observable(undefined);

	var currentSymbol = Computed(locationHash, libraries.val, function(h) {
		logging.debug("Location hash: #{h}");
		if (h === undefined) return undefined; // undefined: "not yet loaded"
		return Symbol.resolveLink(h, libraries);
	});

	var renderer = ui.renderer(libraries);
	var symbolDocs = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer.renderSymbol(sym);
	});

	var breadcrumbs = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer.renderBreadcrumbs(sym);
	});

	var sidebar = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer.renderSidebar(sym);
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
							ui.LOADING.inc();
							var newLocation = require('./search').run(elem, libraries, ui.LOADING.dec);
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
	
	var mainDisplay = Widget('div', symbolDocs, {"class":"mb-main mb-top"}) .. docsStyle;
	var toplevel = Widget("div", `
		<div class="header navbar-inner">
			$searchWidget
			<h1>Conductance docs</h1>
		</div>
		$breadcrumbs
		$sidebar
		$mainDisplay
		$loadingWidget
	`)
	.. Bootstrap()
	.. Class("navbar navbar-inverted")
	.. mainStyle
	.. searchStyle;

	console.log('STYLE', toplevel.style);

	document.body .. withWidget(toplevel) {|elem|
		if(window.rainbow) window.rainbow.hide();
		using (var hashChange = events.HostEmitter(window, 'hashchange')) {
			while(true) {
				locationHash.set(document.location.hash.slice(1));
				console.log("lochash", locationHash.get());
				hashChange.wait();
			}
		}
	};
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
