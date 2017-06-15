@ = require([
  'mho:surface/html'
]);
var {Element, Mechanism, CSS, Class, prependContent, removeNode, RawHTML} = require('mho:surface');
var {each, transform, map, filter, indexed,
     intersperse, toArray, groupBy, sortBy,
     reduce, reverse, join, find, hasElem, at, any
     } = require('sjs:sequence');
var string = require('sjs:string');
var {split, startsWith, endsWith, strip} = string;
var event = require('sjs:event');
var logging = require('sjs:logging');
var Marked = require('sjs:marked');
var {merge, ownValues, ownPropertyPairs, getPath, hasOwn} = require('sjs:object');
var { SymbolMissing, LibraryMissing } = require('./library');
var { encodeNonSlashes, encodeFragment } = require('./url-util');
var Symbol = require('./symbol');
var { ObservableVar } = require('sjs:observable');
var { normalize: normalizeUrl } = require('sjs:url');

var ESCAPE = exports.ESCAPE = 27;
var RETURN = exports.RETURN = 13;

var withOverlay = exports.withOverlay = (function() {
	var overlay = Element("div") .. CSS('{
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
		var [elem] = document.body .. prependContent(o);
		try {
			waitfor {
				return block(elem);
			} or {
				elem .. event.wait('click', {filter: e -> e.target === elem});
			} or {
				document.body .. event.wait('keydown', {filter: e -> e.which == ESCAPE});
			}
		} finally {
			removeNode(elem);
		}
	};
})();


var propertySortKey = ([key, value]) -> key.toLowerCase();

exports.renderer = function(libraries, rootSymbol) {
	// we keep `libraries` and `rootSymbol` in scope, to prevent passing it around to everything

	function markup(text, symbol) {
		if (!text) return undefined;
    if (typeof text !== 'string') {
      logging.debug("Unexpected data for #{symbol}");
      return undefined;
    }
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
		var html = Marked.convert(text, {sanitize:true});

		// auto-generate anchors based on h2 header contents
		html = html.replace(/<(h2)>(.*?)<\/h2>/gi, function(text, tag, heading) {
			var anchor = heading.toLowerCase().replace(/<.*/, '').replace(/[^0-9a-z]+/g, '-')
				.. strip('-')
				.. string.sanitize;
			var [symbolLink] = symbol.link();
			var anchorHref = "##{encodeFragment(symbolLink)}~#{encodeFragment(anchor)}";
			return "<#{tag}>#{heading}<a name=\"#{anchor}\" href=\"#{anchorHref}\" class=\"mb-pilcrow\">&para;</a></#{tag}>";
		});
		return RawHTML(html);
	}

	function FragmentLink(href, text) {
		if (Array.isArray(href)) [href, text] = href;
		return Element("a", text, {"href": '#' + encodeFragment(href)});
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
		return Element("div", docs.desc ? `<h3>Description</h3>${markup(docs.desc, symbol)}`, {"class":"desc"});
	}

	function makeRequireSnippet(symbol, fullModulePath, name) {
    
    var rv = [];
    try {
      
		  if(fullModulePath .. find(p -> p .. startsWith('#'), false) ||
         /\.app$/.test(fullModulePath[fullModulePath.length-1])
        ) {
			  //    documentation URL - not actually importable
        // or app file - doesn't make sense to import
        /* do nothing */
		  }
      else if (/\.api$/.test(fullModulePath[fullModulePath.length-1])) {
        // an api
        rv.push(Element("div", 
                        `<code>require('${fullModulePath.join('')}').connect { |api| ${name ? "api." + name : '...'} }</code>`) .. 
                Class('mb-require')
               );
      }
      else if (!name) {
        // a module
        rv.push(@Div .. Class('mb-require') :: @Code :: `require('${fullModulePath.join('')}');`);
        var docs = symbol.docs();
        if (docs.inlibrary)
          docs.inlibrary .. each { 
            |inlib|
            rv.push(@Div .. Class('mb-require') :: @Code :: `require('${inlib.library}')${inlib.as ? ".#{inlib.as}"};${inlib.when ? " //in #{inlib.when} environment only"}`);
          }
      }
      else {
        // a symbol in module
        rv.push(@Div .. Class('mb-require') :: @Code :: `require('${fullModulePath.join('')}').${name};`);

        var docs = symbol.docs();
        if (docs.inlibrary)
          docs.inlibrary .. each { 
            |inlib|
            rv.push(@Div .. Class('mb-require') :: @Code :: `require('${inlib.library}')${inlib.as ? ".#{inlib.as}" : ".#{name}"};${inlib.when ? " //in #{inlib.when} environment only"}`);
          }

        var module_docs = symbol.parent().docs();
        if (module_docs.inlibrary)
          module_docs.inlibrary .. each { 
            |inlib|
            rv.push(@Div .. Class('mb-require') :: @Code :: `require('${inlib.library}')${inlib.as ? ".#{inlib.as}"}.${name};${inlib.when ? " //in #{inlib.when} environment only"}`);
          }
      }
    }
    catch (e) {
      console.log("Error in conductance/doc/ui::makeRequireSnippet: #{e}");
    }

    return rv;
	};

  function makeDemo(docs) {
    if (!docs.demo) return undefined;

    // determine type of demo
    var type = docs.demo.match(/^\/\/\s*([^\s]+)/);
    if (type) 
      type = '-'+type[1];
    else
      type = '';

    return Element("div", [
      `<h3>Demonstration</h3>`,
      Element("iframe", undefined, {src: "demo-eval#{type}.app" .. normalizeUrl(module.id)}) ..
      Mechanism(function(elem) {
        elem.contentWindow.resize = function() { hold(0); elem.height = elem.contentWindow.document.body.scrollHeight + 'px'; };
        while (!elem.contentWindow.run) 
          hold(10);
        elem.contentWindow.run(docs.demo)
      })
    ]);
  }

	function toCamelCase(str) {
		return str.replace(/^[A-Z]+/, s -> s.toLowerCase());
	};

	function versionWidget(library) {
		if (!library) return undefined;
		var docs = library && library.loadSkeletonDocs();
		var version = docs && docs.version;
		return version ? Element("div", "#{library.name} #{docs.version}", {"class":"version"});
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
		return Element("span", types .. intersperse(" | ") .. toArray, {"class":"mb-type"});
	}

	function makeFunctionHtml(docs, symbol) {
		var rv = [];
		rv.push(Element("h3", functionSignature(docs, symbol), {"class":"mb-signature"}));
		rv.push(Element("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"}));

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
			rv.push(makeRequireSnippet(symbol, symbol.fullModulePath, symbol.name));
		}
    */

		if (docs.type == "function" || docs.type == "ctor") {
			rv.push(makeFunctionHtml(docs, symbol));
			rv.push(makeDescriptionHTML(docs, symbol));
		} else {
			var summary = Element("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"});
			if (docs.type == "class") {
				var constructor = docs.children .. ownPropertyPairs .. find([name, val] -> val.type == 'ctor', undefined);

				rv.push(`<h2>Class ${constructor ? 'with eponymous constructor'} ${docs.inherit ? [" inheriting", makeTypeHTML(docs.inherit,symbol)]}</h2>`);
				rv.push(summary);

				if (docs.desc) {
					rv.push(Element("div", makeDescriptionHTML(docs, symbol), {"class":"mb-class-desc"}));
				}

				if (constructor) {
					var [name, child] = constructor;
					var childSymbol = symbol.child(name);
					rv.push(makeFunctionHtml(child, childSymbol));
					rv.push(makeDescriptionHTML(child, childSymbol));
				}

				var children = collectModuleChildren(docs, symbol);
				rv.push(
					Element("div", [
						children['proto']           .. then(Table),
            //children['ctor']            .. then(HeaderTable("Constructor")),
						children['static-function'] .. then(HeaderTable("Static Functions")),
						children['function']        .. then(HeaderTable("Methods")),
						children['variable']        .. then(HeaderTable("Member Variables")),
					] .. filter .. toArray,
					{"class": "symbols"}));
			} else {
				// probably a variable
				rv.push(summary);
				var signature = [
					symbol.className ? "#{symbol.className .. toCamelCase()}.",
					symbol.name,
				];
				if (docs.valtype) {
					signature.push(` <span class='mb-rv'>${makeTypeHTML(docs.valtype, symbol)}</span>`);
				}

				rv.push(Element("h3", signature, {"class":"mb-signature"}));
				rv.push(makeDescriptionHTML(docs, symbol));
			}
		}

    rv.push(makeDemo(docs));

		return rv;
	}

	function accumulateByType(obj, mapFn) {
		var rv = {};
		obj .. ownPropertyPairs .. sortBy(propertySortKey) .. each {
			|[name, val]|
			var type = val.type;
			if (val['static']) type = 'static-'+type;
			if (!rv .. hasOwn([type])) rv[type] = [];
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

		rv.push(Element("h2", makeSummaryHTML(docs, symbol)));

		rv.push(Element("div", docs.desc ? `${markup(docs.desc, symbol)}`, {"class":"desc"}));

		var collector = docs.type === 'doclib' ? collectLibChildren : collectModuleChildren;
		// collect modules & dirs:
		var children = collector(docs, symbol);
		// XXX `lib` and `module` are obviously overloaded here
		rv.push(
			Element("div", [
				children['lib'] .. then(HeaderTable("Sections")),
				children['module'] .. then(HeaderTable("Sub-Topics")),
				children['syntax']   .. then(HeaderTable("Syntax")),
				children['feature']   .. then(HeaderTable("Features")),
        children['directive'] .. then(HeaderTable("Directives")),
				children['function'] .. then(HeaderTable("Functions")),
				children['variable'] .. then(HeaderTable("Variables")),
				children['class']    .. then(HeaderTable("Classes")),
			] .. filter .. toArray,
			{"class": "symbols"}));
		return rv;
	}

  function makeTemplateView(docs, symbol) {
    var rv = [];
    rv.push(`<h2>The ${symbol.name} template</h2>`);

    rv.push(Element('div', makeSummaryHTML(docs, symbol), 
                    {"class":"mb-summary"}));
    rv.push(makeDescriptionHTML(docs, symbol));

		var children = collectModuleChildren(docs, symbol);

    rv.push(
      Element("div", [
        children['directive'] .. then(HeaderTable("Directives")),
        children['function'] .. then(HeaderTable("Functions")),
				children['variable'] .. then(HeaderTable("Variables"))
      ] .. filter .. toArray,
              {"class": "symbols"}));
    
    return rv;
  }

	function makeModuleView(docs, symbol) {
		var rv = [];
		rv.push(`<h2>The ${symbol.relativeModulePath ..join('')} module</h2>`);
		/* rv.push(makeRequireSnippet(symbol, symbol.fullModulePath)); */

		rv.push(Element("div", makeSummaryHTML(docs, symbol), {"class":"mb-summary"}));
		rv.push(makeDescriptionHTML(docs, symbol));

		var executable = docs.executable;
		if (executable) {
			rv.push(`
			<h3>This module is executable</h3>
			<p>
			You can run it directly from the command-line, using either:
<code class="mb-commandline">sjs <strong>${symbol.fullModulePath .. join('')}</strong> [...]</code>
<code class="mb-commandline">conductance exec <strong>${symbol.fullModulePath .. join('')}</strong> [...]</code>
			</p>`);
		}

	
		var children = collectModuleChildren(docs, symbol);

		rv.push(
			Element("div", [
				children['function'] .. then(HeaderTable("Functions")),
				children['variable'] .. then(HeaderTable("Variables")),
				children['class']    .. then(HeaderTable("Classes")),
			] .. filter .. toArray,
			{"class": "symbols"}));

		return rv;
	};

	var then = (val, fn) -> val ? fn(val);
	var Table = (contents) -> Element("table", contents);
	var HeaderTable = (header) -> (contents) -> [Element("h3", header), Table(contents)];

	function makeLibView(docs, symbol) {
		var rv = [];
		rv.push(Element("h2", makeSummaryHTML(docs, symbol)));

		rv.push(makeDescriptionHTML(docs, symbol));

		// collect modules & dirs:
		var children = collectLibChildren(docs, symbol);
		rv.push(children.lib .. then(HeaderTable("Sub-Libraries")));
		rv.push(children.module .. then(HeaderTable("Modules")));
		return rv;
	};

	var centerView = Mechanism {|elem|
		var container = document.getElementById("sidebar");
		container.scrollTop = elem.offsetTop - (container.clientHeight / 2);
	};

	function listChildren(parent, symbol) {
		var docs = parent.skeletonDocs();
		if (!docs.children) return [];
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
						children = Element("ul", children) .. Class("active-children");
					}
					return [Element("li", name, {"class":"active"}) .. centerView, children];
				} else {
					return Element("li", FragmentLink(href, name));
				}
			});
	};

	function makeIndexView(parent, symbol) {
		var ancestors = parent.parentLinks();
		ancestors.unshift(['', `&#x21aa;`]);
		var links = listChildren(parent, symbol);
		links = ancestors .. reverse .. reduce(links, function(children, [href, name]) {
			return Element("li", [FragmentLink(href, name), Element("ul", children)]);
		});
		return Element("ul", links);
	};

	function renderMissing(symbol) {
		if (symbol.library) {
			return `
				${Element("h1", `No such symbol: ${symbol.link()[0]}`) .. errorText()}
				<p>The link you followed may be broken, or it may be intended for a different version of the library.</p>
			`;
		} else {
			return Element("h1", "Unknown library: #{symbol.moduleUrl}") .. errorText();
		}
	};

	return {
		renderSymbol: function (symbol, anchor) {
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
          case 'template':
            view = makeTemplateView(docs, symbol);
            break;
					default:
						logging.debug("defaulting to symbol view for docs", docs);
						view = makeSymbolView(docs, symbol);
						break;
				}

				if (symbol.library && symbol.library.root) {
					// add a "source" link where possible
					var library = symbol.library;
					var root = library.root;
					var path = symbol.relativeModulePath .. join();
					if (!path .. endsWith('/') && !/.*\..*/.test(path)) path += '.sjs';
					var pathURI = path .. encodeNonSlashes();

					view = [view, Element("div", [
						`<p>
							${versionWidget(library)}
							<a href="${root}${pathURI}?format=src">[source]</a>
						</p>`,
					],
					{"class":"mb-canonical-url"})];
				}
			} catch(e) {
				if (e instanceof SymbolMissing)
					view = renderMissing(symbol);
				else
					throw e;
			}
			var elem = Element("div", view);
			if (anchor !== undefined) {
				elem = elem .. Mechanism(function(elem) {
					var activeElem = document.getElementsByName(anchor)[0];
					if(activeElem) {
						activeElem.scrollIntoView(true);
					}
				});
			}
			return elem;
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

			return Element("div", view, {"id":"sidebar"});
		},

		renderBreadcrumbs: function(symbol) {
			var prefix = '#';
			var sep = Element("span", ` &raquo; `, {"class": "sep"});

			var ret = symbol.parentLinks() .. map(FragmentLink);
			// add `leaf` class to final element
			ret[ret.length - 1] = ret[ret.length - 1] .. Class('leaf');

			var crumbs = ret .. intersperse(sep) .. toArray();
			var content = [crumbs];

      var docs = symbol.docs();
      
      var snippet = Element("div", `&nbsp;`, {"class":"version"});

      switch(docs.type) {
        case 'module':
          snippet = makeRequireSnippet(symbol, symbol.fullModulePath);
          break;
        case 'lib':
        case 'doclib':
        case 'doc':
          break;
        case 'directive':
        case 'template':
          if (symbol.parent().docs().type === 'template') {
            snippet = Element('div', 
                              `<code>/** @template ${
                                         symbol.fullModulePath .. at(-1)
                                         } */</code>`) .. 
              Class('mb-require');
          }
          break;
        case 'class':
          if (docs.children .. ownPropertyPairs .. any([name, val] -> val.type == 'ctor'))
            snippet = makeRequireSnippet(symbol, symbol.fullModulePath, symbol.name);
          break;
        default:
          if ((!symbol.className || docs.type == 'ctor') && docs.type !== 'class') {
            var parent = symbol.parent();
            var symbol_path;
            if (parent && parent.docs().type === 'template')
              symbol_path = ['mho:app'];
            else
              symbol_path = symbol.fullModulePath;
            snippet = makeRequireSnippet(symbol, symbol_path, symbol.name);
          }
      }
      content.push(snippet);
			return Element("div", content, {"class":"breadcrumbs"});
		},
	}
}


exports.Hub = function(name) {
	return `<span class="hub">$name</span>`;
};

// TODO: shouldn't need !important decl here, battling with
// bootstrap
var errorText = exports.errorText = CSS("{
    color: rgb(190, 29, 29) !important;
}");
