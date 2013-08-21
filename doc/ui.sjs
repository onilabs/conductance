var {Widget, Mechanism, Style, Class, prependWidget, removeElement} = require('mho:surface');
var {Observable} = require('mho:observable');
var {each, transform, map, filter, indexed, intersperse, toArray, groupBy, sortBy, reduce, reverse} = require('sjs:sequence');
var string = require('sjs:string');
var {split, endsWith} = string;
var {Quasi} = require('sjs:quasi');
var array = require('sjs:array');
var events = require('sjs:events');
var logging = require('sjs:logging');
var Marked = require('sjs:marked');
var Url = require('sjs:url');
var {merge, ownPropertyPairs} = require('sjs:object');

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
		color: white;
	}') .. Class("overlay");

	return function(cls, block) {
		var o = overlay;
		if (arguments.length == 1) {
			block = arguments[0];
		} else {
			o = o .. Class('overlay-' + cls);
		}
		var elem = document.body .. prependWidget(o);
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


exports.renderer = function(libraries) {
	// we keep `libraries` in scope, to prevent passing it around to everything

	function markup(text, symbol) {
		if (!text) return undefined;
		logging.debug("Rendering: ", text);
		// try to linkify everything that looks like a doc reference
		text = text.replace(/\[([^ \]]+)\](?![\[\(])/g, function(orig, dest) {
			var resolved = resolveLink(dest, symbol);
			if (!resolved) return orig;
			var [link, dest] = resolved;
			return "[#{dest}](##{link})";
		});
		return Quasi([Marked.convert(text)]);
	}

	function Link(href, text) {
		if (Array.isArray(href)) [href, text] = href;
		return Widget("a", text, {"href": '#' + href});
	}

	function makeSummaryHTML(docs, symbol) {
		var rv = [];
		rv.push(markup(docs.summary, symbol));

		if (docs.deprecated)
			rv.push(`
				<div class="note">
					${markup("**Deprecated:** "+docs.deprecated, symbol)}
				</div>`);

		if (docs.hostenv)
			rv.push(`<div class='note'>
					<b>Note:</b> This ${docs.type} only works in the '${docs.hostenv}' version of StratifiedJS.
				</div>`);

		return rv;
	}

	function makeDescriptionHTML(docs, symbol) {
		return Widget("div", docs.desc ? `<h3>Description</h3>${markup(docs.desc, symbol)}`, {"class":"desc"});
	}

	function makeRequireSnippet(modulePath, name) {
		return Widget("div", `<code>require('${modulePath.join('')}')${name ? "." + name};</code>`) .. Class('mb-require');
	};

	function functionSignature(docs, symbol) {
		var signature = [];
		if (docs.type != 'ctor' && symbol.classname && !docs['static'])
			signature.push(symbol.classname.toLowerCase()+"."+symbol.name);
		else {
			var call = symbol.name;
			if (docs.type == 'ctor' && !docs.nonew) {
				if (call.indexOf('.') != -1)
					call = '('+call+')';
				call = "new "+call;
			}
			signature.push(call);
		}

		var params = (docs.param||[]) .. map(function(p) {
			var name = p.name || '.';
			if (p.valtype && p.valtype .. array.contains("optional"))
				name = `<span class="mb-optarg">${name}</span>`;
			return name;
		}) .. intersperse(", ");

		signature.push(`(<span class="mb-arglist">$params</span>)`);

		if (docs['return']) {
			signature.push(` <span class='mb-rv'>returns ${makeTypeHTML(docs['return'].valtype, symbol)}</span>`);
		}

		if (docs.altsyntax) {
			docs.altsyntax .. each {|altsyntax|
				signature.push(`<br>`);

				// wrap [...] in an 'mb-optarg' span
				var parts = altsyntax
					.. split(/(\[[^\]]+\])/)
					.. indexed
					.. map(function([idx, str]) {
						if (idx % 2) return (idx % 2) ? `<span class='mb-optarg'>$str</span>` : str;
					});
				signature = signature.concat(parts);
			}
		}
		
		return signature;
	};

	function functionArgumentDetails(docs, symbol) {
		var rv = [];
		var makeRow = function(val, name) {
			name = name || val.name;
			var def = val.defval ? `<span class='mb-defval'>Default: `+makeTypeHTML(val.defval, symbol)+"</span>";
			return `
			<tr>
				<td class='mb-td-symbol'>${name}</td>
				<td>
					${makeTypeHTML(val.valtype, symbol)}
					${def}${makeSummaryHTML(val, symbol)}
				</td>
			</tr>`;
		};

		var args = (docs.param || []) .. map(p -> makeRow(p, p.name || '.'));
		var settings = (docs.setting || []) .. map(makeRow);
		var attribs = (docs.setting || []) .. map(makeRow);

		if (args.length)		 rv.push(`<table>$args</table>`);
		if (settings.length) rv.push(`<h3>Settings</h3><table>$settings</table>`);
		if (attribs.length)  rv.push(`<h3>Attribs</h3><table>${attribs}</table>`);
		return rv;
	};

	function resolveLink(dest, symbol) {
		if (dest.indexOf("::") == -1) return null; // ids we care about contain '::'
		logging.info("resolving link: #{dest}");
		var Symbol = require('./symbol.sjs');

		var url, desc = dest.replace(/^[\/\.:]+|[\/\.:]+$/g, '');

		var leadingComponent = dest.split("::", 1)[0];
		if (leadingComponent == "") {
			// absolute link within our module (eg "::Semaphore::acquire", or "::foo")
			[url] = symbol.moduleLink();
			url += dest;
		}
		else if (leadingComponent .. string.startsWith(".")) {
			// relative link
			var [moduleUrl] = symbol.moduleLink();
			logging.debug("relativizing #{dest} against #{moduleUrl}");
			url = Url.normalize(dest, moduleUrl);
		}
		else if (leadingComponent .. string.contains(":")) {
			// leadingComponent has hub / protocol: treat it as an absolute link
			[url, desc] = Symbol.resolveLink(dest, libraries).link();
		} else {
			logging.info("Assuming library-relative link for #{dest}");
			[url] = symbol.moduleLink();
			url += dest .. string.rstrip(':');
		}

		logging.debug("resolved to #{url}");
		if (!url) return null;
		return [url, desc];
	}

	function makeTypeHTML(types, symbol) {
		if (!types) return [];
		types = types.split("|");
		var rv = [];
		types = types .. transform(function(type) {
			var resolved = resolveLink(type.replace('optional ',''), symbol);
			if (resolved) {
				var [url, desc] = resolved;
				type = `${type.indexOf('optional') != -1 ? "optional "}${Link(url, desc)} `;
			}
			return type;
		});
		return Widget("span", types .. intersperse("|") .. toArray, {"class":"mb-type"});
	}

	function makeSymbolView(docs, symbol) {
		var rv = [];
		var [moduleLink, moduleDesc] = symbol.moduleLink();
		if (symbol.classname) {
			var name = docs['static'] ? symbol.classname + "." + symbol.name : symbol.name;
			rv.push(Widget("h2", [
				Link(moduleLink, moduleDesc),
				"::",
				Link("#{moduleLink}::#{symbol.className}", symbol.classname),
				"::",
				name
			]));
			if (docs.type == 'ctor' || docs['static'] || docs.type == 'proto') {
				rv.push(makeRequireSnippet(symbol.modulePath, name));
			}
		} else {
			rv.push(Widget("h2", `${Link(moduleLink, moduleDesc)}::${symbol.name}`));
			if (docs.type != 'class') {
				rv.push(makeRequireSnippet(symbol.modulePath, symbol.name));
			}
		}

		rv.push(Widget("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"}));
		
		if (docs.type == "function" || docs.type == "ctor") {
			rv.push(Widget("h3", functionSignature(docs, symbol)));

			rv.push(functionArgumentDetails(docs, symbol));

			if (docs['return'] && docs['return'].summary) {
				rv.push(`
					<h3>Return Value</h3>
					<table><tr>
						<td>
							${makeTypeHTML(docs['return'].valtype, symbol)}
							${makeSummaryHTML(docs['return'], symbol)}
						</td>
					</tr></table>`);
			}
		} else if (docs.type == "class") {
			rv.push(`<h3>Class ${symbol.symbol}${docs.inherit ? [" inherits", makeTypeHTML(docs.inherit,symbol)]}</h3>`);

			var children = collectModuleChildren(docs, symbol);
			rv.push(
				Widget("div", [
					children['ctor']            .. then(Table),
					children['proto']           .. then(Table),
					children['static-function'] .. then(HeaderTable("Static Functions")),
					children['function']        .. then(HeaderTable("Methods")),
					children['variable']        .. then(HeaderTable("Member Variables")),
				] .. filter .. toArray,
				{"class": "symbols"}));
		}

		rv.push(makeDescriptionHTML(docs, symbol));

		return rv;
	}

	function accumulateByType(obj, mapFn) {
		var rv = {};
		obj .. ownPropertyPairs .. each {
			|[name, val]|
			var type = val.type;
			if (val['static']) type = 'static-'+type;
			if (!rv[type])  rv[type] = [];
			rv[type].push(mapFn(name, val));
		}
		return rv;
	}

	function collectModuleChildren(obj, symbol) {
		var [symbolLink] = symbol.link();
		return accumulateByType(obj.children, (name, child) -> `
			<tr>
				<td class="mb-td-symbol">
					${Link("#{symbolLink}::#{name}", name)}
				</td>
				<td>${makeSummaryHTML(child, symbol)}</td>
			</tr>`
		);
	};

	function collectLibChildren(obj, symbol) {
		var [modulePath] = symbol.link();
		return accumulateByType(obj.children, (name, child) -> `
				<tr>
					<td class='mb-td-symbol'>
						${Link(modulePath + name, name)}
					</td>
					<td>${makeSummaryHTML(child, symbol)}</td>
				</tr>`
		);
	};

	function makeJSONView(docs, symbol) {
		// TODO: remove this function
		if (symbol)
			docs = docs .. merge({modulePath: symbol.modulePath, symbolPath: symbol.symbolPath});
		return Widget("pre", JSON.stringify(docs, null, '  '));
	};

	function makeModuleView(docs, symbol) {
		var rv = [];
		rv.push(`<h2>The ${symbol.modulePath} module</h2>`);
		rv.push(makeRequireSnippet(symbol.modulePath));

		rv.push(Widget("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"}));
		rv.push(makeDescriptionHTML(docs, symbol));
	
		var children = collectModuleChildren(docs, symbol);

		rv.push(
			Widget("div", [
				children['function'] .. then(HeaderTable("Functions")),
				children['variable'] .. then(HeaderTable("Variables")),
				children['class']    .. then(HeaderTable("Classes")),
			] .. filter .. toArray,
			{"class": "symbols"}));

		return rv;
	};

	var then = (val, fn) -> val ? fn(val);
	var Table = (contents) -> Widget("table", contents);
	var HeaderTable = (header) -> (contents) -> [Widget("h3", header), Table(contents)];

	function makeLibView(docs, symbol) {
		var rv = [];
		rv.push(Widget("h2", docs.lib || "Unnamed Module Collection"));
		rv.push(Widget("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"}));
		rv.push(makeDescriptionHTML(docs, symbol));

		// collect modules & dirs:
		var children = collectLibChildren(docs, symbol);
		rv.push(children.lib .. then(HeaderTable("Directories")));
		rv.push(children.module .. then(HeaderTable("Modules")));

		return rv;
	};

	function makeRootView() {
		return makeJSONView(libraries);
	};

	function makeRootIndex() {
		return makeJSONView(libraries);
	};

	var centerView = Mechanism {|elem|
		var container = document.getElementById("sidebar");
		container.scrollTop = elem.offsetTop - (container.clientHeight / 2);
	};

	function listChildren(parent, symbol) {
		var docs = parent.skeletonDocs();
		var getType = prop -> prop[1].type;
		return docs.children
		.. ownPropertyPairs
		.. sortBy(getType)
		.. map(function([name, val]) {
				var [href, name] = parent.childLink(name, val);
				if (symbol && name == symbol.name) {
					// currently selected
					var children = listChildren(symbol);
					if (children.length) {
						children = Widget("ul", children) .. Class("active-children");
					}
					return [Widget("li", name, {"class":"active"}) .. centerView, children];
				} else {
					return Widget("li", Widget("a", name, {href: '#' + href}));
				}
			});
	};

	function makeIndexView(parent, symbol) {
		if (parent === null) {
			return makeRootIndex();
		}
		var ancestors = parent.parentLinks();
		var links = listChildren(parent, symbol);
		links = ancestors .. reverse .. reduce(links, function(children, [href, name]) {
			return Widget("li", [Widget("a", name, {href: '#' + href}), Widget("ul", children)]);
		});
		return Widget("ul", links);
	};

	return {
		renderSymbol: function (symbol) {
			if (symbol === null) return makeRootView();
			var docs = symbol.docs();
			logging.debug("Rendering docs", docs, "for", symbol);
			var view;

			switch(docs.type) {
				case 'module':
					view = makeModuleView(docs, symbol);
					break;
				case 'lib':
					view = makeLibView(docs, symbol);
					break;
				default:
					view = makeSymbolView(docs, symbol);
					break;
			}
			return Widget("div", view);
		},

		renderSidebar: function(symbol) {
			if (symbol === null) return undefined;
			var parent = symbol.parent();
			var view = makeIndexView(parent, symbol);
			return Widget("div", view, {"id":"sidebar"});
		},

		renderBreadcrumbs: function(symbol) {
			var ret = [];
			var prefix = '#';
			var sep = Widget("span", ` &raquo; `, {"class": "sep"});
			if (symbol) {
				ret = symbol.parentLinks().slice(0, -1) .. map([href, name] -> Widget("a", name, {href: prefix + href}));
				ret.push(Widget('span', symbol.name, {"class":"leaf"}));
			}
			return Widget("div", ret .. intersperse(sep), {"class":"breadcrumbs"});
		},
	}
}

