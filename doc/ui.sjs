var {Widget, Style, Class, prependWidget, removeElement} = require('mho:surface');
var {Observable} = require('mho:observable');
var {each, transform, map, indexed, intersperse, toArray} = require('sjs:sequence');
var {split} = require('sjs:string');
var {Quasi} = require('sjs:quasi');
var array = require('sjs:array');
var events = require('sjs:events');
var logging = require('sjs:logging');
var Marked = require('sjs:marked');
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
		text = text.replace(/\[([^\]]*::[^\]]+)\](?![\[\(])/g, function(orig, dest) {
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
		return docs.desc ? `<h3>Description</h3>${markup(docs.desc, symbol)}`;
	}

	function makeRequireSnippet(modulePath, name) {
		return Widget("div", `<code>require('${modulePath.join('')}').${name};</code>`) .. Class('mb-require');
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
		var Symbol = require('./symbol.sjs');
		logging.info("resolving link: #{dest}");

		if (dest.indexOf("::") == -1) return null; // ids we care about contain '::'

		var url, desc = dest.replace(/^[\/\.:]+/, '');

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
			[url] = Symbol.moduleLink();
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
		var parts = [];
		var [moduleLink, moduleDesc] = symbol.moduleLink();
		if (symbol.classname) {
			var name = docs['static'] ? symbol.classname + "." + symbol.name : symbol.name;
			parts.push(Widget("h2", [
				Link(moduleLink, moduleDesc),
				"::",
				Link("#{moduleLink}::#{symbol.className}", symbol.classname),
				"::",
				name
			]));
			if (docs.type == 'ctor' || docs['static'] || docs.type == 'proto') {
				parts.push(makeRequireSnippet(symbol.modulePath, name));
			}
		} else {
			parts.push(Widget("h2", `${Link(moduleLink, moduleDesc)}::${symbol.name}`));
			if (docs.type != 'class') {
				parts.push(makeRequireSnippet(symbol.modulePath, symbol.name));
			}
		}

		parts.push(makeSummaryHTML(docs, symbol));
		
		if (docs.type == "function" || docs.type == "ctor") {
			parts.push(Widget("h3", functionSignature(docs, symbol)));

			parts.push(functionArgumentDetails(docs, symbol));

			if (docs['return'] && docs['return'].summary) {
				parts.push(`
					<h3>Return Value</h3>
					<table><tr>
						<td>
							${makeTypeHTML(docs['return'].valtype, symbol)}
							${makeSummaryHTML(docs['return'], symbol)}
						</td>
					</tr></table>`);
			}
		} else if (docs.type == "class") {
			parts.push(`<h3>Class ${symbol.symbol}${docs.inherit ? [" inherits", makeTypeHTML(docs.inherit,symbol)]}</h3>`);

			// collect symbols
			var symbols = {};
			var [symbolLink] = symbol.link();
			docs.symbols .. ownPropertyPairs .. each {
				|[name, s]|
				var type = s.type;
				if (s['static'])		 type = 'static-'+type;
				if (!symbols[type])  symbols[type] = [];
				symbols[type].push(`
					<tr>
						<td class="mb-td-symbol">${Link("#{symbolLink}::#{name}", name)}</td>
						<td>${makeSummaryHTML(s, symbol)}</td>
					</tr>`);
			}
			
			if (symbols['ctor'])
				parts.push(`<table>${symbols['ctor']}</table>`);
			if (symbols['proto'])
				parts.push(`<table>${symbols['proto']}</table>`);
			if (symbols['static-function'])
				parts.push(`<h3>Static Functions</h3><table>${symbols['static-function']}</table>`);
			if (symbols['function'])
				parts.push(`<h3>Methods</h3><table>${symbols['function']}</table>`);
			if (symbols['variable'])
				parts.push(`<h3>Member Variables</h3><table>${symbols['variable']}</table>`);
		}

		parts.push(makeDescriptionHTML(docs, symbol));

		return parts;
	}

	return function (symbol) {
		logging.debug("Rendering docs for", symbol);
		var docs = symbol.docs();
		var parts = [];

		if (symbol.symbolPath) {
			parts.push(makeSymbolView(docs, symbol));
		} else {
			// TODO: render all types
			docs = docs .. merge({modulePath: symbol.modulePath, symbolPath: symbol.symbolPath});
			parts.push(Widget("pre", JSON.stringify(docs, null, '  ')));
		}
		return Widget("div", parts);
	};
}

