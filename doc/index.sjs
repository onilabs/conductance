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
	var defaultHubs = ['sjs:','mho:'];

	var locationHash = Observable(undefined);

	var currentSymbol = Computed(locationHash, libraries.val, function(h) {
		logging.debug("Location hash: #{h}");
		if (h === undefined) return undefined; // undefined: "not yet loaded"
		return Symbol.resolveLink(h, libraries);
	});

	var renderer = ui.renderer(libraries, new Symbol.RootSymbol(libraries));
	var symbolDocs = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer.renderSymbol(sym);
	});

	var breadcrumbs = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer.renderBreadcrumbs(sym);
	});

	var sidebar = Computed(currentSymbol, function(sym) {
		return sym !== undefined ? renderer.renderSidebar(sym);
	});

	defaultHubs .. each(h -> libraries.add(h));

	var loadingText = ui.LOADING .. Computed(l -> "#{l} item#{l != 1 ? "s" : ""}");
	var loadingWidget = Widget("div", `Loading ${loadingText}...`)
			.. Class("loading")
			.. Class("hidden", Computed(ui.LOADING, l -> l == 0));

	var hubDebug = Computed(libraries.val, function(hubs) {
		return JSON.stringify(hubs, null, '  ');
	});
	var hubDisplay = Widget("pre", hubDebug);

	var FORWARD_SLASH = (e) -> e.which == 47;
	var PLUS = (e) -> e.which == 43 && e.shiftKey;

	var toolbar = Widget("div", `
			<div class="trigger">
				<button class="btn search"><i class="icon-search"></i></button>
				<button class="btn config"><i class="icon-cog"></i></button>
			</div>
		`)
		.. Style("{ position: relative; top:1.1em}")
		.. Class("popupContainer")
		.. Mechanism(function(elem) {
			var [searchButton, configureButton] = elem.getElementsByTagName("button");

			var buttonContainer = elem.getElementsByTagName("div")[0];

			var doSearch = function() {
				ui.LOADING.inc();
				var newLocation = require('./search').run(elem, libraries, ui.LOADING.dec);
				if (newLocation) {
					document.location.hash = newLocation;
				}
			};

			var doConfig = function() {
				ui.LOADING.inc();
				require('./config').run(elem, libraries, defaultHubs, ui.LOADING.dec);
			};


			using (var searchClick = searchButton .. events.HostEmitter('click')) {
				using (var searchShortcut = document.body .. events.HostEmitter('keypress', FORWARD_SLASH)) {
					using (var configClick = configureButton .. events.HostEmitter('click')) {
						using (var configShortcut = document.body .. events.HostEmitter('keypress', PLUS)) {
							while(true) {
								var action;
								waitfor {
									waitfor {
										searchClick.wait();
									} or {
										searchShortcut.wait();
									}
									action = doSearch;
								} or {
									waitfor {
										configClick.wait();
									} or {
										configShortcut.wait();
									}
									action = doConfig;
								}
								buttonContainer.classList.add('hidden');
								try {
									action();
								} finally {
									buttonContainer.classList.remove('hidden');
								}
							}
						}
					}
				}
			}
		});

	var mainDisplay = Widget('div', symbolDocs, {"class":"mb-main mb-top"}) .. docsStyle;
	var toplevel = Widget("div", `
		<div class="header navbar-inner">
			$toolbar
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

	document.body .. withWidget(toplevel) {|elem|
		if(window.rainbow) window.rainbow.hide();
		using (var hashChange = events.HostEmitter(window, 'hashchange')) {
			while(true) {
				locationHash.set(document.location.hash.slice(1));
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
