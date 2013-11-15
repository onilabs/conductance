#!/usr/bin/env conductance
// vim: syntax=sjs:
/*
  Construct a conductance stdlib based on the current SJS one,
  to prevent drift between the two
*/

@ = require('sjs:std');
var @docutil = require('sjs:docutil');

var [target, _, stamp] = @argv();
@logging.setLevel(process.env['REDO_XTRACE'] ? @logging.VERBOSE : @logging.WARN);


var stdlibPath = require.resolve('sjs:std').path .. @url.toPath;
@childProcess.run('redo-ifchange', [stdlibPath]);
var baseStdlibContents = @fs.readFile(stdlibPath, 'utf-8').replace(/module\.exports *=(.|[\n\r])*/g, '');
var stdlibContents = (baseStdlibContents + "
/**
  // metadata for sjs:bundle:
  @require mho:observable
  @require mho:surface
  @require mho:env
*/

modules = modules.concat([
  {id:'mho:env', name:'env'},
  {id:'mho:observable', exclude: ['at', 'get']},
  {id:'mho:observable', name: 'observable'},
  {id:'mho:surface'}
]);

if (hostenv === 'nodejs') {
  modules = modules.concat([
    {id:'mho:server', include:['Host', 'Route', 'Port']},
    {id:'mho:server', name:'server'},
    {id:'mho:server/routes', name:'routes'},
    'mho:server/response',
    'mho:server/generator',
  ]);
}

module.exports = require(modules);
");

@verbose("CONTENTS:\n#{stdlibContents}");

// eval stdlib with a mocked-out `require()`
var realRequire = require('builtin:apollo-sys').require;
@assert.ok(realRequire);

var hostModules = {};
HOSTENVS = ['nodejs', 'xbrowser'];
HOSTENVS .. @each {|hostenv|
  var mockRequire = function(modules) {
    if (modules .. @startsWith('builtin:')) {
      // bootstrap part - return actual result
      var result = realRequire.apply(null, arguments);
      result.hostenv = hostenv;
      return result;
    }

    @assert.ok(Array.isArray(modules));
    hostModules[hostenv] = modules;
    return {}; // we don't actually use the results
  };
  global.require = mockRequire;

  var module = {exports:{}};
  @eval("(
  function(module, require) {
    #{stdlibContents};
  })")(module,mockRequire);
}

var requiredModulesUnion = @concat(HOSTENVS .. @map(h -> hostModules[h]));
// build a list of [mod, hostenvs] from both hostenv sets:
var requiredModules = [];
requiredModulesUnion .. @each {|mod|

  // skip duplicates:
  if (requiredModules .. @find([m, env] -> @eq(m, mod))) continue;

  // find number of occurences for this module
  var hostenvs = HOSTENVS .. @filter(h -> hostModules[h] .. @find(m -> m .. @eq(mod))) .. @toArray;
  requiredModules.push([mod, hostenvs]);
}


var moduleSource = {};
var generatedDocs = [];
requiredModules .. @each {|[mod, hostenvs]|
  if (@isString(mod)) mod = { id: mod };

  var generatedDoc = generatedDocs .. @at(-1, null);
  if (!generatedDoc || generatedDoc[0] != mod.id) {
    generatedDoc = [mod.id, initModuleDoc(mod.id, hostenvs)];
    generatedDocs.push(generatedDoc);
  }
  var docs = generatedDoc[1];

  var claim = function(name, sym) {
    if (!name) throw new Error("can't claim symbol: #{name}");
    if (moduleSource[name]) throw new Error("conflict: #{name}");
    moduleSource[name] = mod.id;
    if (sym) {
      var type = moduleDocs.children[sym] .. @get('type');
      docs.push(" - **#{name}**: (#{type} [#{mod.id}::#{sym}])");
    } else {
      docs.push(" - **#{name}**: (module #{makeModuleLink(mod.id)})");
    }
  };
  var claimAll = function(syms, moduleDocs) {
    @info("#{mod.id} - claiming:\n  #{syms .. @join("\n  ")}");
    syms .. @each(s -> claim(s, s, moduleDocs));
  };

  if(mod.name) {
    @info("claiming #{mod.name}");
    claim(mod.name);
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
@assert.ok(generatedDocs.length > 0, "docs are empty!");

function makeModuleLink(id) {
  if (id .. @startsWith("nodejs:")) {
    var mod = id.substr(7);
    return "[#{id}](http://nodejs.org/api/#{mod}.html)";
  } else {
    return "[#{id}::]";
  }
};

function initModuleDoc(id, hostenvs) {
  var link = makeModuleLink(id);
  var header = ["### From the #{link} module:"];
  if (hostenvs.length < HOSTENVS.length) {
    header.push("*(when in the #{hostenvs .. @join("/")} environment)*");
  }
  return header;
};

var content = stdlibContents;
content += "
/**
@noindex
@summary Common functionality for conductance applications
@desc
  This module combines commonly-used functionality from the
  [mho:] and [sjs:] standard libraries.

  Typically, conductance applications and scripts will use this
  module to access common functionality in a single line:

      @ = require('mho:stdlib');

  (see also: [sjs:#language/syntax::@altns])

  Below are a list of the symbols exposed in this module, with
  links to the symbol's original module.

#{generatedDocs .. @transform(pair -> pair[1]) .. @concat .. @map(line -> "  #{line}") .. @join("\n")}
*/";

@fs.writeFile(stamp, content);
@fs.writeFile('stdlib.sjs', "
/* ------------------------------------ *
 * NOTE:                                *
 *   This file is auto-generated        *
 *   any manual edits will be LOST      *
 * ------------------------------------ */
"
+ content);

var proc = @childProcess.launch('redo-stamp', [], {'stdio':['pipe', null, null]});
proc.stdin .. @write(content);
proc.stdin.end();
proc .. @childProcess.wait();
