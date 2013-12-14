//TODO: use merging require([.])
waitfor {
var {RequireStyle, OnClick, Class, Mechanism, Widget, removeNode, appendContent, Style} = require('mho:surface');
} and {
var seq = require('sjs:sequence');
var {map, indexed, find, each, join, transform } = seq;
} and {
var { Observable, Computed } = require('mho:observable');
} and {
var array = require('sjs:array');
} and {
var event = require('sjs:event');
} and {
var {preventDefault} = require('sjs:xbrowser/dom');
} and {
var cutil = require('sjs:cutil');
} and {
var str = require('sjs:string');
} and {
var {ownPropertyPairs, ownValues, hasOwn} = require('sjs:object');
} and {
var logging = require('sjs:logging');
} and {
var http = require('sjs:http');
} and {
var Url = require('sjs:url');
} and {
var assert = require('sjs:assert');
} and {
var ui = require('./ui');
} and {
var Symbol = require('./symbol');
} and {
var Library = require('./library');
} and {
var { encodeFragment } = require('./url-util');
}

logging.setLevel(logging.DEBUG);
Symbol.setLoadingIndicator(ui.LOADING.block);

var mainStyle   = RequireStyle(Url.normalize('css/main.css', module.id))
var docsStyle   = RequireStyle(Url.normalize('css/docs.css', module.id))
var searchStyle = RequireStyle(Url.normalize('css/search.css', module.id));

exports.run = function(root) {
	var libraries = Library.Collection();
	var defaultHubs = ['sjs:','mho:'];

	var locationHash = Observable(undefined);

	var currentSymbol = Computed(locationHash, libraries.val, function(h) {
		logging.debug("Location hash: #{h}");
		if (h === undefined) return undefined; // undefined: "not yet loaded"
		return Symbol.resolveSymbol(libraries, h);
	});

	var renderer = ui.renderer(libraries, new Symbol.RootSymbol(libraries));
	var symbolDocs = currentSymbol .. transform(function(sym) {
		return sym !== undefined ? renderer.renderSymbol(sym);
	});

	var breadcrumbs = currentSymbol .. transform(function(sym) {
		return sym !== undefined ? renderer.renderBreadcrumbs(sym);
	});

	var sidebar = currentSymbol .. transform(function(sym) {
		return sym !== undefined ? renderer.renderSidebar(sym);
	});

	defaultHubs .. each(h -> libraries.add(h));

	var loadingText = ui.LOADING .. transform(l -> "#{l} item#{l != 1 ? "s" : ""}");
	var loadingWidget = Widget("div", `Loading ${loadingText}...`)
			.. Class("loading")
			.. Class("hidden", ui.LOADING .. transform(l -> l == 0 ? true : (hold(300), false))); // the hold(300) is to avoid showing the indicator for actions that just take very little time

	var hubDebug = libraries.val .. transform(function(hubs) {
		return JSON.stringify(hubs, null, '  ');
	});
	var hubDisplay = Widget("pre", hubDebug);

	var toolbar = Widget("div", `
			<div class="trigger">
				<button class="btn config"><span class="glyphicon glyphicon-cog"></span></button>
				<button class="btn search" title="Shortcut: /"><span class="glyphicon glyphicon-search"></span></button>
			</div>
		`)
		.. Class("popupContainer")
		.. Mechanism(function(elem) {
			var [configureButton, searchButton] = elem.getElementsByTagName("button");

			var buttonContainer = elem.getElementsByTagName("div")[0];

			var doSearch = function() {
				ui.LOADING.inc();
				var newLocation = require('./search').run(elem, libraries, ui.LOADING.dec);
				if (newLocation) {
					document.location.hash = encodeFragment(newLocation);
				}
			};

			var doConfig = function() {
				ui.LOADING.inc();
				require('./config').run(elem, libraries, defaultHubs, ui.LOADING.dec);
			};

			// we ignore keyboard shortcuts while we're performing an action
			var action;
			var FORWARD_SLASH = (e) -> !action && e.which == 47;
			var PLUS = (e) -> !action && e.which == 43 && e.shiftKey;

			using (var searchClick = searchButton .. event.HostEmitter('click', {handle: preventDefault})) {
				using (var searchShortcut = document.body .. event.HostEmitter('keypress', {filter: FORWARD_SLASH, handle: preventDefault})) {
					using (var configClick = configureButton .. event.HostEmitter('click', {handle: preventDefault})) {
						using (var configShortcut = document.body .. event.HostEmitter('keypress', {filter: PLUS, handle: preventDefault})) {
							while(true) {
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
									action = null;
									buttonContainer.classList.remove('hidden');
								}
							}
						}
					}
				}
			}
		});

	var mainDisplay = Widget('div', symbolDocs, {"class":"mb-main mb-top"}) .. docsStyle;
	var header = Widget("div", [
		toolbar,
//		`<h1>Conductance docs</h1>`
	])
		.. Class("header");

  var hint;
  if (!window.localStorage || !window.localStorage['search-hint-shown']) {
    hint =  `<div class='alert alert-warning'>Hint: You can press '/' to search the reference<a class='close' href='#'>&times;</a></div>` .. Mechanism(function(node) {
      node.querySelector('a') .. event.wait('click', {handle: preventDefault});
      if (window.localStorage)
        window.localStorage['search-hint-shown'] = true;
      node.remove();
    });
  }


	var toplevel = Widget("div", [
		sidebar,
		header,
		breadcrumbs,
    hint,
		mainDisplay,
		loadingWidget
	], {'class':'documentationRoot'})
	.. mainStyle
	.. searchStyle;

	root .. appendContent(toplevel) {|elem|
		if(window.rainbow) window.rainbow.hide();
		using (var hashChange = event.HostEmitter(window, 'hashchange')) {
			while(true) {
				locationHash.set(decodeURIComponent(document.location.hash.slice(1)));
				hashChange.wait();
			}
		}
	};
};


exports.main = function(root) {
	// wraps `run` with error handling
	var error = cutil.Condition();
	window.onerror = function(e) {
		error.set(e);
	};

	waitfor {
		var e = error.wait();
		logging.error(String(e));
		ui.withOverlay("error") {|bg|
			root .. appendContent(Widget("div",
				`<h1>:-(</h1>
				<h3>There was an error: </h3>
						<pre>${e.toString()}</pre>
				<p>You shouldn't have seen this error; please report to info@onilabs.com.</p>
				<p>
					To try again, reload the page or start over:
				</p>
				<p>
					<button class="reload btn">Reload page</button>
					<button class="restart btn">Start over</button>
				</p>
			`, {"class":"error-contents"})) {|elem|
				window.scrollTo(0,0);
				waitfor {
					elem.querySelector('button.reload') .. event.wait('click');
				} or {
					elem.querySelector('button.restart') .. event.wait('click');
					document.location.hash = "";
				}
			}
		}
		document.location.reload();
	} and {
		try {
			exports.run(root);
		} catch(e) {
			error.set(e);
		}
	}
};

if (require.main === module) {
	exports.main(document.body);
}
