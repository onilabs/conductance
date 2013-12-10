var {Widget, Mechanism, Style, Class, prependWidget, removeElement} = require('mho:surface');
var {each, transform, map, filter, indexed,
     intersperse, toArray, groupBy, sortBy,
     reduce, reverse, join, find, hasElem
     } = require('sjs:sequence');
var string = require('sjs:string');
var {split, startsWith, endsWith, strip} = string;
var {Quasi} = require('sjs:quasi');
var event = require('sjs:event');
var logging = require('sjs:logging');
var Marked = require('sjs:marked');
var {merge, ownValues, ownPropertyPairs, getPath} = require('sjs:object');
var { SymbolMissing, LibraryMissing } = require('./library');
var { encodeNonSlashes, encodeFragment } = require('./url-util');
var Symbol = require('./symbol');
var { Observable } = require('mho:observable');

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
				elem .. event.wait('click', {filter: e -> e.target === elem});
			} or {
				document.body .. event.wait('keydown', {filter: e -> e.which == ESCAPE});
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

var propertySortKey = ([key, value]) -> key.toLowerCase();

exports.renderer = function(libraries, rootSymbol) {
	// we keep `libraries` and `rootSymbol` in scope, to prevent passing it around to everything

	function markup(text, symbol) {
		if (!text) return undefined;
		logging.debug("Rendering: ", text);
		if (symbol) {
			// try to linkify everything that looks like a doc reference
			text = text .. Symbol.replaceInternalMarkdownLinks(function(dest) {
				var resolved = symbol.resolveLink(dest);
				if (!resolved) return;
				var [link, dest] = resolved;
				return "[#{dest}](##{encodeFragment(link)})";
			});
		}
		return Quasi([Marked.convert(text, {sanitize:true})]);
	}

	function FragmentLink(href, text) {
		if (Array.isArray(href)) [href, text] = href;
		return Widget("a", text, {"href": '#' + encodeFragment(href)});
	}

	function makeSummaryHTML(docs, symbol) {
		var rv = [];

		// apply notes from the original docs, before alias resolution
		if (docs.deprecated)
			rv.push(`
				<div class="note">
					${markup("**Deprecated:** "+docs.deprecated, symbol)}
				</div>`);

		if (docs.hostenv)
			rv.push(`<div class='note'>
					<b>Note:</b> This ${docs.type} only works in the '${docs.hostenv}' version of StratifiedJS.
				</div>`);


		if (docs.alias) {
			var dest = symbol.resolveLink(docs.alias);
			var destDesc = docs.alias .. strip(':');
			var destDocs, destSymbol;
			var destLink = `<code>${destDesc}</code>`;
			if (dest) {
				var url = dest[0];
				try {
					destSymbol = Symbol.resolveSymbol(url, libraries);
					destLink = FragmentLink(url, destDesc);
					//destDocs = destSymbol.docs();
				} catch(e) {
					logging.warn("Failed to load docs for #{docs.alias}: #{e}");
				}
			}
			if (destDocs) {
				// supplant own docs with dest docs
				docs = destDocs;
				symbol = destSymbol;
				rv.unshift(`<em>(Alias of $destLink)</em>`);
			} else {
				rv.unshift(`Alias of $destLink`);
			}
		};

		rv.unshift(markup(docs.summary, symbol));

		return rv;
	}

	function makeDescriptionHTML(docs, symbol) {
		return Widget("div", docs.desc ? `<h3>Description</h3>${markup(docs.desc, symbol)}`, {"class":"desc"});
	}

	function makeRequireSnippet(fullModulePath, name) {
		if(fullModulePath .. find(p -> p .. startsWith('#'))) {
			// documentation URL - not actually importable
			return undefined;
		}
		return Widget("div", `<code>require('${fullModulePath.join('')}')${name ? "." + name};</code>`) .. Class('mb-require');
	};

	function toCamelCase(str) {
		return str.replace(/^[A-Z]+/, s -> s.toLowerCase());
	};

	function functionSignature(docs, symbol) {
		var signature = [];
		if (docs.type != 'ctor' && symbol.className && !docs['static'])
			signature.push("#{symbol.className .. toCamelCase()}.#{symbol.name}");
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
			if (p.valtype && p.valtype .. string.contains("optional"))
				name = `<span class="mb-optarg">[${name}]</span>`;
			return name;
		}) .. intersperse(", ") .. toArray();

		signature.push(`(<span class="mb-arglist">$params</span>)`);

		if (docs['return']) {
			signature.push(` <span class='mb-rv'><span class='glyphicon glyphicon-arrow-right'></span> ${makeTypeHTML(docs['return'].valtype, symbol)}</span>`);
		}

		if (docs.altsyntax) {
			docs.altsyntax .. each {|altsyntax|
				signature.push(`<br>`);

				// wrap [...] in an 'mb-optarg' span
				var parts = altsyntax
					.. split(/(\[[^\]]+\])/)
					.. indexed
					.. map(function([idx, str]) {
						return (idx % 2) ? `<span class='mb-optarg'>$str</span>` : str;
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
			var def = val.defval ? `<span class='mb-defval'>Default: ${val.defval}</span>`;
			return `
			<tr class='mb-param'>
				<td class='mb-td-symbol'>${name}</td>
				<td>
					${makeTypeHTML(val.valtype, symbol)}
					${def}${makeSummaryHTML(val, symbol)}
				</td>
			</tr>`;
		};

		var args = (docs.param || []) .. map(p -> makeRow(p, p.name || '.'));
		var settings = (docs.setting || []) .. map(makeRow);
		var attribs = (docs.attrib || []) .. map(makeRow);

		if (args.length)		 rv.push(`<table>$args</table>`);
		if (settings.length) rv.push(`<h3>Settings</h3><table>$settings</table>`);
		if (attribs.length)  rv.push(`<h3>Attribs</h3><table>$attribs</table>`);
		return rv;
	};

	function makeTypeHTML(types, symbol) {
		if (!types) return [];
		types = types.split("|");
		var rv = [];
		types = types .. transform(function(type) {
			var resolved = symbol.resolveLink(type.replace('optional ',''));
			if (resolved) {
				var [url, desc] = resolved;
				type = `${type.indexOf('optional') != -1 ? "optional "}${FragmentLink(url, desc)}`;
			}
			return type;
		});
		return Widget("span", types .. intersperse(" | ") .. toArray, {"class":"mb-type"});
	}

	function makeFunctionHtml(docs, symbol) {
		var rv = [];
		rv.push(Widget("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"}));
		rv.push(Widget("h3", functionSignature(docs, symbol), {"class":"mb-signature"}));

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
		return rv;
	};

	function makeSymbolView(docs, symbol) {
		var rv = [];
		var [moduleLink, moduleDesc] = symbol.moduleLink();
		/* if (!symbol.className && docs.type != 'class') {
			rv.push(makeRequireSnippet(symbol.fullModulePath, symbol.name));
		}
    */

		if (docs.type == "function" || docs.type == "ctor") {
			rv.push(makeFunctionHtml(docs, symbol));
			rv.push(makeDescriptionHTML(docs, symbol));
		} else {
			var summary = Widget("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"});
			if (docs.type == "class") {
				rv.push(`<h2>Class ${symbol.name}${docs.inherit ? [" inherits", makeTypeHTML(docs.inherit,symbol)]}</h2>`);
				rv.push(summary);

				if (docs.desc) {
					rv.push(Widget("div", makeDescriptionHTML(docs, symbol), {"class":"mb-class-desc"}));
				}

        /*
				var constructor = docs.children .. ownPropertyPairs .. find([name, val] -> val.type == 'ctor');
				if (constructor) {
					var [name, child] = constructor;
					var childSymbol = symbol.child(name);
					rv.push(makeFunctionHtml(child, childSymbol));
					rv.push(makeDescriptionHTML(child, childSymbol));
				}
        */

				var children = collectModuleChildren(docs, symbol);
				rv.push(
					Widget("div", [
						children['proto']           .. then(Table),
            children['ctor']            .. then(HeaderTable("Constructor")),
						children['static-function'] .. then(HeaderTable("Static Functions")),
						children['function']        .. then(HeaderTable("Methods")),
						children['variable']        .. then(HeaderTable("Member Variables")),
					] .. filter .. toArray,
					{"class": "symbols"}));
			} else {
				// probably a variable
				rv.push(summary);
				rv.push(`<h3 class='mb-signature'>${symbol.className ? "#{symbol.className .. toCamelCase()}."}${symbol.name}</h3>`);
				rv.push(makeDescriptionHTML(docs, symbol));
			}
		}


		return rv;
	}

	function accumulateByType(obj, mapFn) {
		var rv = {};
		obj .. ownPropertyPairs .. sortBy(propertySortKey) .. each {
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
					${FragmentLink("#{symbolLink}::#{name}", name)}
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
						${FragmentLink(modulePath + name, name)}
					</td>
					<td>${makeSummaryHTML(child, symbol)}</td>
				</tr>`
		);
	};

	function makeDocView(docs, symbol) {
		var rv = [];
		rv.push(`<h2>${docs.name}</h2>`);

		rv.push(Widget("h2", makeSummaryHTML(docs, symbol)));

		rv.push(Widget("div", docs.desc ? `${markup(docs.desc, symbol)}`, {"class":"desc"}));

		var collector = docs.type === 'doclib' ? collectLibChildren : collectModuleChildren;
		// collect modules & dirs:
		var children = collector(docs, symbol);
		// XXX `lib` and `module` are obviously overloaded here
		rv.push(
			Widget("div", [
				children['lib'] .. then(HeaderTable("Sections")),
				children['module'] .. then(HeaderTable("Sub-Topics")),
				children['syntax']   .. then(HeaderTable("Syntax")),
				children['feature']   .. then(HeaderTable("Features")),
				children['function'] .. then(HeaderTable("Functions")),
				children['variable'] .. then(HeaderTable("Variables")),
				children['class']    .. then(HeaderTable("Classes")),
			] .. filter .. toArray,
			{"class": "symbols"}));
		return rv;
	}

	function makeModuleView(docs, symbol) {
		var rv = [];
		rv.push(`<h2>The ${symbol.relativeModulePath ..join('')} module</h2>`);
		/* rv.push(makeRequireSnippet(symbol.fullModulePath)); */

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
		rv.push(Widget("h2", makeSummaryHTML(docs, symbol)));

		rv.push(makeDescriptionHTML(docs, symbol));

		// collect modules & dirs:
		var children = collectLibChildren(docs, symbol);
		rv.push(children.lib .. then(HeaderTable("Libraries")));
		rv.push(children.module .. then(HeaderTable("Modules")));
		return rv;
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
		.. filter(prop -> getType(prop) != 'ctor')
		.. sortBy(propertySortKey)
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
					return Widget("li", FragmentLink(href, name));
				}
			});
	};

	function makeIndexView(parent, symbol) {
		var ancestors = parent.parentLinks();
		ancestors.unshift(['', `&#x21aa;`]);
		var links = listChildren(parent, symbol);
		links = ancestors .. reverse .. reduce(links, function(children, [href, name]) {
			return Widget("li", [FragmentLink(href, name), Widget("ul", children)]);
		});
		return Widget("ul", links);
	};

	function renderMissing(symbol) {
		if (symbol.library) {
			return `
				${Widget("h1", `No such symbol: ${symbol.link()[0]}`) .. errorText()}
				<p>The link you followed may be broken, or it may be intended for a different version of the library.</p>
			`;
		} else {
			return Widget("h1", "Unknown library: #{symbol.moduleUrl}") .. errorText();
		}
	};

	return {
		renderSymbol: function (symbol) {
			logging.debug("Rendering docs for", symbol);
			var view;
			try {
				var docs = symbol.docs();

				switch(docs.type) {
					case 'module':
						view = makeModuleView(docs, symbol);
						break;
					case 'lib':
						view = makeLibView(docs, symbol);
						break;
					case 'doclib':
					case 'doc':
						view = makeDocView(docs, symbol);
						break;
					default:
						logging.debug("defaulting to symbol view for docs", docs);
						view = makeSymbolView(docs, symbol);
						break;
				}

				if (symbol.library && symbol.library.root) {
					// add a "source" link where possible
					var root = symbol.library.root;
					var path = symbol.relativeModulePath .. join();
					if (!path .. endsWith('/')) path += '.sjs';
					var pathURI = path .. encodeNonSlashes();
					view = [view, Widget("div", `<a href="${root}${pathURI}">[source]</a>`, {"class":"mb-canonical-url"})];
				}
			} catch(e) {
				if (e instanceof SymbolMissing)
					view = renderMissing(symbol);
				else
					throw e;
			}
			return Widget("div", view);
		},

		renderSidebar: function(symbol) {
			logging.debug("rendering sidebar for symbol", symbol);
			var view;
			try {
				view = makeIndexView(symbol.parent() || rootSymbol, symbol);
			} catch(e) {
				if (e instanceof SymbolMissing || e instanceof LibraryMissing) {
					// display root view
					view = makeIndexView(rootSymbol);
				} else {
					throw e;
				}
			}

			return Widget("div", view, {"id":"sidebar"});
		},

		renderBreadcrumbs: function(symbol) {
			var prefix = '#';
			var sep = Widget("span", ` &raquo; `, {"class": "sep"});

			var ret = symbol.parentLinks().slice(0, -1) .. map(FragmentLink);
			ret.push(Widget('span', symbol.name, {"class":"leaf"}));

			var crumbs = ret .. intersperse(sep) .. toArray();
			var content = [crumbs];

      var docs = symbol.docs();
      
      switch(docs.type) {
        case 'module':
          content.push(makeRequireSnippet(symbol.fullModulePath));
          break;
        case 'lib':
        case 'doclib':
        case 'doc':
          var version;
			    if (symbol.library) {
				    var docs = symbol.library.loadSkeletonDocs();
				    if(docs && docs.version) {
					    version = Widget("div", "#{symbol.library.name}#{docs.version}", {"class":"version"});
				    }
			    }
          else
			      version = Widget("div", `Conductance documentation browser`, {"class":"version"});
			    content.push(version);
          break;
        default:
          if ((!symbol.className || docs.type == 'ctor') && docs.type !== 'class')
            content.push(makeRequireSnippet(symbol.fullModulePath, symbol.name));
          else
            content.push(Widget("div", `&nbsp;`, {"class":"version"}));
      }

			return Widget("div", content, {"class":"breadcrumbs"});
		},
	}
}


exports.Hub = function(name) {
	return `<span class="hub">$name</span>`;
};

// TODO: shouldn't need !important decl here, battling with
// bootsrap
var errorText = exports.errorText = Style("{
    color: rgb(190, 29, 29) !important;
}");
