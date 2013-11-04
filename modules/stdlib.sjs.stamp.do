#!/usr/bin/env conductance
// vim: syntax=sjs:

var stdlib = require('./stdlib');
@ = stdlib;
var [target, _, stamp] = @argv();
@childProcess.run('redo-ifchange', ['stdlib.sjs']);
var stdlibContents = @fs.readFile('stdlib.sjs', 'utf-8');
var @docutil = require('sjs:docutil');
@logging.setLevel(process.env['REDO_XTRACE'] ? @logging.VERBOSE : @logging.WARN);

var requiredModules = [];
var realRequire = require('builtin:apollo-sys').require;
@assert.ok(realRequire);
var mockRequire = function(modules) {
  if (Array.isArray(modules)) {
    requiredModules = @toArray(modules);
  }
  return realRequire.apply(null, arguments);
};

// eval stdlib with a mocked-out `require()`
var exports = {};
global.require = mockRequire;
exports = @eval("(
function(exports, require) {
  #{stdlibContents};
  return exports;
})")(exports,mockRequire);


var docs = [];
var moduleSource = {};
requiredModules .. @each {|mod|
  if (@isString(mod)) mod = { id: mod };

  var claim = function(sym, moduleDocs) {
    if (!sym) throw new Error("can't claim symbol: #{sym}");
    if (moduleSource[sym]) throw new Error("conflict: #{sym}");
    moduleSource[sym] = mod.id;
    if (moduleDocs) {
      docs.push("@#{moduleDocs.children[sym] .. @get('type')} #{sym}");
      docs.push("@alias #{mod.id}::#{sym}");
    } else {
      docs.push("@variable #{mod.name}");
      docs.push("@alias #{mod.id}");
    }
  };
  var claimAll = function(syms, moduleDocs) {
    @info("#{mod.id} - claiming:\n  #{syms .. @join("\n  ")}");
    syms .. @each(s -> claim(s, moduleDocs));
  };

  if(mod.name) {
    @info("claiming #{mod.name}");
    claim(mod.name, null);
  } else {
    var moduleDocs = require.resolve(mod.id).path .. @url.toPath .. @fs.readFile .. @docutil.parseModuleDocs;
    if (mod.include) {
      mod.include .. claimAll(moduleDocs);
    } else {
      moduleDocs.children
        .. @ownKeys
        .. @toArray
        .. @difference(mod.exclude || [])
        .. claimAll(moduleDocs);
    }
  }
}
@assert.ok(docs.length > 0, "docs are empty!");

var contentEnd = stdlibContents.match(/\/\/ GENERATED DOCS:.*\n/);
@assert.ok(contentEnd, "Can't find GENERATED DOCS marker line...");
var content = stdlibContents.slice(0, contentEnd.index + contentEnd[0].length);

content += "/**\n@noindex\n#{docs .. @join("\n")}\n*/";

@fs.writeFile(stamp, content);
@fs.writeFile('stdlib.sjs', content);

var proc = @childProcess.launch('redo-stamp', [], {'stdio':['pipe', null, null]});
proc.stdin .. @write(content);
proc.stdin.end();
proc .. @childProcess.wait();
