@ = require('sjs:std');
@docutil = require('sjs:docutil');

//----------------------------------------------------------------------
// build system helpers - same as in 
// stratifiedjs/src/build/buildscript.sjs, but modern SJS style

var gBuilders = {}, gPseudos = {};

// PSEUDO: Mark given target as a pseudo-target; i.e. there is no
// corresponding disk file for it.
function PSEUDO(target) {
  gPseudos[target] = true;
}

// BUILD: "builder construction function"
// Sets task and dependencies for a given target.
// task can be a shell command or a function
function BUILD(target, task, deps) {
  deps = deps || [];
  // builders are dependent on the buildscript itself:
  if (target !== "src/build/buildscript.sjs")
    deps.push("src/build/buildscript.sjs");

  // We only want to execute the builder once and return the memoized
  // result on subsequent invocations. By utilizing `memoize`
  // we can additionally ensure that these semantics
  // also work when the builder is called concurrently while it is
  // still running:
  gBuilders[target] = @fn.memoize:: -> _run_builder(target, task, deps);
}

// builder that just evaluates its dependencies sequentially
function SEQ(target, deps) {
  deps = deps || [];
  gBuilders[target] = @fn.memoize:: -> _run_deps_seq(target, deps);
}

// builder that identifies a file without dependencies and without associated 
// build task:
function SOURCE(target) {
  gBuilders[target] = ()->undefined;
}

// builder that copies src to target:
function CP(target, src) {
  BUILD(target, 
        [ "CP $0 $TARGET" ],
        [ src ]);
}

// number of concurrent builders; coordinated globally and not via locally constraining each.par
// because each builder can spawn other builders...
var BUILDER_PARALLELISM = 10;
var gBuildingPermits = @Semaphore(BUILDER_PARALLELISM, true);

function timestamp(target, istarget) {
  if (!gPseudos[target]) {
    try {
      return @fs.stat(target).mtime;
    }
    catch(e) { /* file doesn't exist yet */ }
  }
  // non-existant file or pseudo
  return istarget ? new Date(0) : new Date("2100");
}

function _run_deps_seq(target, deps) {
  deps .. @each {
    |dep|
    if (gBuilders[dep]) {
      gBuilders[dep]();
    }
    else { 
      throw new Error("No builder for target '#{dep}'");
    }
  }
 }

function _run_builder(target, task, deps) {
  var ts = timestamp(target, true);
  var dirty = (deps.length === 0);
  console.log("Building '#{target}'");
  
  // first run dependencies:
  deps .. @each.par {
    |dep|
    if (gBuilders[dep]) {
      gBuilders[dep]();
    }
    else { 
      throw new Error("No builder for target '#{dep}'");
    }
    if (timestamp(dep) >= ts) {
      //        console.log("timestamp #{target} (#{ts}) <= #{dep} (#{timestamp(dep)})"); 
      dirty = true;
    }
  }
  if (task === undefined) return; // nothing to do
  gBuildingPermits.synchronize {
    ||
    // now run the build task:
    if (dirty) {
      try {
        console.log("'#{target}' deps dirty; running build task");
        _run_task(target, task, deps);
      }
      catch (e) {
        process.stderr.write("Error executing task for '"+target+"':"+e);
        throw e;
      }
    }
    return target;
  } // with building permit
}

function _run_task(target, task, deps) {
  if (Array.isArray(task)) {
    task .. @each { 
      |subtask|      
      _run_task(target, subtask, deps);
    }
  }
  else if (typeof task == "function") {
    task(target, deps);
  }
  else if (typeof task == "string") {
    // we assume it's a shell command
    // do some replacements first: $0,... : dependencies, $TARGET: target
    task = task.replace(/\$(\d+)/g, function(m,n) { return deps[n]; });
    task = task.replace(/\$TARGET/g, target);
    //console.log("* Executing shell command: '"+task+"'");
    @childProcess.run('bash', ['-c', task], {stdio:'inherit'});
  }
  else
    throw new Error("Unknown task type in builder '"+target+"'");
}

//----------------------------------------------------------------------
// DEPENDENCY TREE

function build_dep_tree() {

  //--------------------
  // top-level targets:
  PSEUDO("clean");
  BUILD("clean", []);
  PSEUDO("build");
  SEQ("build", 
      [ 
        "1st build step",
        "2nd build step" 
      ]);

  PSEUDO("1st build step");
  BUILD("1st build step",
        undefined,
        [
          "modules/std.sjs",
          "surface_bootstrap",
          "test/modules.txt"
        ]);

  PSEUDO("2nd build step");
  BUILD("2nd build step",
        undefined,
        [
          "modules/sjs-lib-index.json"
        ]);

  //--------------------
  // source files
  SOURCE("src/build/buildscript.sjs");
  SOURCE("src/build/std.sjs");
  SOURCE("node_modules/stratifiedjs/src/build/std.sjs");
  SOURCE("node_modules/stratifiedjs/tools/document-stdlib.sjs");
  SOURCE("modules/surface/base.sjs");
  SOURCE("modules/surface/nodes.sjs");
  SOURCE("modules/surface/dynamic.sjs");
  SOURCE("modules/surface/static.sjs");
  SOURCE("modules/surface/bootstrap/html.sjs");
  SOURCE("modules/surface/bootstrap/components.sjs");
  SOURCE("src/deps/bootstrap/dist/css/bootstrap.min.css");
  SOURCE("src/deps/bootstrap/dist/js/bootstrap.min.js");
  SOURCE("src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.eot");
  SOURCE("src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.svg");
  SOURCE("src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf");
  SOURCE("src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.woff");
  SOURCE("package.json");

  //--------------------
  // std module
  BUILD("modules/std.sjs", function(dest) {
    var { generateDocDescription } = require('sjs:../tools/document-stdlib');
    // XXX contents should be generated from '@inlibrary' doc-comments
    var contents = @fs.readFile(require.resolve('sjs:../src/build/std.sjs').path ..@url.toPath, 'utf-8');
    contents += @fs.readFile(require.resolve('./std.sjs').path ..@url.toPath, 'utf-8');
    contents += "module.exports = require(modules);\n";
    var descriptionDocs = generateDocDescription(contents, "
This module combines commonly-used functionality from the
Conductance and StratifiedJS standard libraries. It includes
everything from the [sjs:std::] SJS module, plus functionality
available only to conductance applications.

Typically, conductance applications and scripts will use this
module to access common functionality in a single line:

    @ = require('mho:std');

(see also: [sjs:#language/syntax::@altns])");

    dest .. @fs.writeFile("
/* ---------------------------------------- *
 * NOTE:                                    *
 * This file is auto-generated.             *
 * Any manual edits will be LOST            *
 * (edit src/build/buildscript.sjs instead) *
 * ---------------------------------------- */
#{contents}
/**
@noindex
@summary Common functionality for Conductance applications
#{descriptionDocs}
*/
");
  }, [
    "src/build/std.sjs", "node_modules/stratifiedjs/src/build/std.sjs",
    "node_modules/stratifiedjs/tools/document-stdlib.sjs",
    "modules/surface.sjs"
  ]);

  //--------------------
  // surface.sjs
  BUILD("modules/surface.sjs", function(dest) {
    var contents = @fs.readFile(dest, 'utf-8');
    var MARKER = '\n// GENERATED DOCS FOLLOW:\n';
    var contentEnd = contents.indexOf(MARKER);
    if (contentEnd != -1) 
      contents = contents.slice(0, contentEnd);

    var sub_modules = ['modules/surface/base.sjs',
                       'modules/surface/nodes.sjs',
                       'modules/surface/dynamic.sjs',
                       'modules/surface/static.sjs'];

    var unindent = (s) -> s.replace(/^\n+/, '') .. @unindent;

    var doc_comments = sub_modules ..
      @transform(f -> @fs.readFile(f, 'utf-8')) ..
      @transform(@docutil.extractDocComments) ..
      @concat ..
      @filter(comment -> !(comment..@contains('@nodoc') ||
                           comment..@contains('@noindex')
                          )) ..
      @transform(unindent) ..
      // for some reason escaping '*\/' in doc comments gets lost:
      @transform(x->x.replace(/\*\//,'*\\/'));

    var output = contents + MARKER + "
/**

@require ./surface/base
@require ./surface/nodes
@require ./surface/dynamic

#{doc_comments .. @join("\n")}
*/
";

    dest .. @fs.writeFile(output);
  }, [
    "modules/surface/base.sjs", "modules/surface/nodes.sjs",
    "modules/surface/dynamic.sjs", "modules/surface/static.sjs",
    "node_modules/stratifiedjs/tools/document-stdlib.sjs"
  ]);

  //--------------------
  // bootstrap
  BUILD("surface_bootstrap", undefined,
        [
          "modules/surface/bootstrap.sjs",
          "modules/surface/bootstrap/bootstrap-vanilla-3.css",
          "modules/surface/bootstrap/bootstrap.min.js",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.eot",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.svg",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.ttf",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.woff"
        ]);
  PSEUDO("surface_bootstrap");

  // surface/bootstrap.sjs
  BUILD("modules/surface/bootstrap.sjs", function(dest) {
    var sub_modules = [
      "modules/surface/bootstrap/html.sjs",
      "modules/surface/bootstrap/components.sjs"];

    var unindent = (s) -> s.replace(/^\n+/, '') .. @unindent;

    var doc_comments = sub_modules ..
      @transform(f -> @fs.readFile(f, 'utf-8')) ..
      @transform(@docutil.extractDocComments) ..
      @concat ..
      @filter(comment -> !(comment..@contains('@nodoc') ||
                           comment..@contains('@noindex')
                          )) ..
      @transform(unindent) ..
      // for some reason escaping '*\/' in doc comments gets lost:
      @transform(x->x.replace(/\*\//,'*\\/'));

    var output = "
/* DON'T EDIT THIS FILE; IT IS GENERATED BY
 * src/build/buildscript.sjs
 */

module.exports = require(['./bootstrap/html', './bootstrap/components']);

/**

@require ./bootstrap/html
@require ./bootstrap/components

@summary Bootstrap UI building blocks
@desc
  This modue defines building blocks for documents that make use of the
  [Twitter Bootstrap](http://getbootstrap.com) CSS library built into Conductance.

  It exposes all of the symbols that are defined in the [surface/html::]
  module, but overrides styles where appropriate (e.g. the
  [::Button] element exposed by this module has the Bootstrap style
  classes `btn` and `btn-default` defined, whereas the
  version in [surface/html::] does not). Only those symbols that have such
  custom styles are explicitly documented here. For the full list of symbols
  see the [surface/html::] module.

  In addition to the basic HTML constructs, this module also defines
  Bootstrap-specific building blocks, such as [::Btn].

  When writing a Conductance client-side app
  ([mho:#features/app-file::]), you typically don't import this
  module yourself: Boostrap-enabled templates (such as
  [mho:surface/doc-template/app-default::]; see
  [mho:surface/doc-template/::] for a complete list) will expose all
  of the symbols in this module automatically in a dynamically
  generated [mho:app::] module.

#{doc_comments .. @join("\n")}
*/
";
    dest .. @fs.writeFile(output);
  }, [
    "modules/surface/bootstrap/html.sjs",
    "modules/surface/bootstrap/components.sjs"
  ]);

  // bootstrap-vanilla-3.css
  BUILD("modules/surface/bootstrap/bootstrap-vanilla-3.css",
        function(dest) {
          var src = @fs.readFile("src/deps/bootstrap/dist/css/bootstrap.min.css", "utf-8");
          src = src.replace(/\.\.\/fonts/g, 'fonts');
          dest .. @fs.writeFile(src, 'utf-8');
        }, [
          "src/deps/bootstrap/dist/css/bootstrap.min.css"
        ]);

  // files copied from bootstrap:
  CP("modules/surface/bootstrap/bootstrap.min.js",
     "src/deps/bootstrap/dist/js/bootstrap.min.js");
  CP("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.eot",
     "src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.eot");
  CP("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.svg",
     "src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.svg");
  CP("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.ttf",
     "src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf");
  CP("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.woff",
     "src/deps/bootstrap/dist/fonts/glyphicons-halflings-regular.woff");

  //--------------------
  // lib indexes:
  BUILD("modules/sjs-lib-index.txt",
        function(dest) {
          var config = @fs.readFile('package.json') .. JSON.parse;
          dest .. @fs.writeFile(
            "@summary The Conductance web application framework\n" +
            "@version #{config.version}\n");
        },
        ["package.json"]);


  BUILD("modules/sjs-lib-index.json",
        "node node_modules/stratifiedjs/sjs sjs:compile/doc modules",
        ["modules/sjs-lib-index.txt"]);
  PSEUDO("modules/sjs-lib-index.json"); // backed by a file, but dependencies not enumerable

  //--------------------
  // test index
  var testPattern = '*-tests.sjs';
  BUILD("test/modules.txt",
      [
      "echo '### NOTE: do not edit this file manually,' > $TARGET",
      "echo '### regenerate it by running src/build/make-conductance' >> $TARGET",
      // we find in unit,integration,perf explicitly to force our desired order (i.e unit tests should run first)
      "(for dir in unit integration; do find test/$dir -name '" + testPattern + "' | sort ; done) | cut -d / -f 2- >> $TARGET",
      ]
      );
  PSEUDO("test/modules.txt"); // it's backed by a file, but its dependencies are not enumerable


} // build_dep_tree


//----------------------------------------------------------------------


function build_target(target) {
  // this function must be called with process.cwd() === CONDUCTANCE_HOME
  try {
    console.log("Building dependency tree");
    build_dep_tree();
    console.log("Target: '#{target}'");
    if (!gBuilders[target]) throw new Error("Unknown target '#{target}'");
    gBuilders[target]();
  }
  catch (e) {
    console.log("\nBUILD ERROR\n#{e}\n"); process.exit(1); 
  }
}

//----------------------------------------------------------------------
// main:

// N.B.: Must be called with process.cwd() === CONDUCTANCE_HOME

function usage() {
  process.stdout.write("Conductance build tool\n\n");
  process.stdout.write("Usage: make-conductance [options] [target]\n\n");
  process.stdout.write("Options:\n");
  process.stdout.write("  -h, --help         display this help message\n");
  process.stdout.write("\nTargets:\n");
  process.stdout.write("  clean              clean temporaries\n");
  process.stdout.write("  build              full build (default)\n");
  process.stdout.write("\n");
}

function process_args() {
  var targets = [];
  var argv = @sys.argv();
  for (var i=0; i<argv.length; ++i) {
    var flag = argv[i];
    switch(flag) {
    case "-h":
    case "--help":
      usage();
      process.exit(0);
      break;
    default:
      return argv.slice(i);
      break;
    }
  }
  return ["build"];
}

var targets = process_args();
for(var i=0; i<targets.length; i++) {
  var target = targets[i];
  build_target(target);
  console.log("All done");
}


