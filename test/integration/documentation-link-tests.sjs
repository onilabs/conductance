@ = require('sjs:test/std');
@docutil = require('sjs:docutil');
@helper = require('../helper');

@context("generated documentation") {||
  @library = require('mho:../doc/library');
  @symbol = require('mho:../doc/symbol');
  var libraries = @library.Collection();

  var hubs = ['mho:', 'sjs:'];
  @test.beforeAll {||
    libraries.add('mho:', @helper.url('__mho/'));
    libraries.add('sjs:', @helper.url('__sjs/modules/'));
  }

  function checkMarkdownLinks(text, sym) {
    if (!text) return;
    var links = [];
    text .. @symbol.replaceInternalMarkdownLinks(function(dest) {
      if (dest .. @contains('::')) {
        links.push(dest);
      }
    });
    
    // check links outside `replace` call, as it can't handle
    // blocking code
    links .. @each {|dest|
      //@info("checking link: #{dest} from sym #{sym}");
      var resolved = sym.resolveLink(dest);
      if (!resolved) {
        throw new @assert.AssertionError("bad link: #{dest}");
      }
      var [ url, desc ] = resolved;
      var dest = @symbol.resolveSymbol(libraries, url);
      if (dest instanceof(@symbol.UnresolvedSymbol)) {
        throw new Error("unresolved symbol: #{url}");
      }
      var docs;
      try {
        docs = dest.docs();
      } catch (e) {
        throw new @assert.AssertionError("No such docs: #{url}");
      }
      @assert.ok(docs, "symbol docs are missing for #{url}");
    };
  }


  var checked = {};

  @test("each library has an index") {||
    hubs .. @each {|hub|
      var root = libraries.get(hub);
      var index = root.loadIndex();
      @assert.ok(index, "hub #{hub} has no index");
    }
  }

  @test("broken links") {||
    var failures = [];
    hubs .. @each {|hub|
      var root = libraries.get(hub);
      function checkSymbol(symbol) {
        var id = symbol.path .. @join('|');
        if (id in checked) return;
        checked[id] = true;
        var docs = symbol.docs();
        //console.warn(docs);
        try {
          checkMarkdownLinks(docs.summary, symbol);
          checkMarkdownLinks(docs.desc, symbol);
          //console.warn(docs.children);
        } catch(e) {
          ///fail-fast version, for reducing output
          //throw new Error("Symbol: #{symbol}: #{e.message}");
          if (!e instanceof(@assert.AssertionError)) {
            throw e;
          }
          failures.push("Symbol: #{symbol}: #{e.message}");
        }

        docs.children .. @ownPropertyPairs .. @each {|[name, {type}]|
          checkSymbol(symbol.child(name, type));
        }
      }

      checkSymbol(new @symbol.RootSymbol(libraries));

    }
    if (failures.length) {
      throw new Error("Issues:\n#{failures .. @join("\n")}");
    }
  }

}.serverOnly();
