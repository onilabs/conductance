// Conductance Build Script
/*
 
  A dependency-driven, parallel buildscript for building conductance.
  Like SCons, but simpler, smaller, concurrent (== faster).

*/
@ = require(['sjs:nodejs/fs', 'sjs:object', 'sjs:sequence', 'sjs:sys', 'sjs:url']);

//----------------------------------------------------------------------
// BUILD DEPENDENCIES

function build_deps() {

  //----------------------------------------------------------------------
  // top-level targets:

  PSEUDO("clean");
  BUILD("clean", ["rm -rf \
    tmp \
    ", function() { log('all done')}]);

  PSEUDO("build");
  BUILD("build", function() { log('all done') }, 
        [
          "modules/surface/bootstrap/bootstrap-vanilla-3.css",
          "modules/surface/bootstrap/bootstrap.min.js",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.eot",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.svg",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.ttf",
          "modules/surface/bootstrap/fonts/glyphicons-halflings-regular.woff",
          "tmp/version_stamp"
        ]);

  //----------------------------------------------------------------------
  // mho module library:
  // (many of the modules don't need to be built from source; they just
  //  live under the modules directory directly.)

  // bootstrap css
  BUILD("modules/surface/bootstrap/bootstrap-vanilla-3.css",
        ["./node_modules/.bin/recess $0 --compress > $TARGET"
        ],
        ["src/deps/bootstrap/less/bootstrap.less",
         "src/deps/bootstrap/less/variables.less"
        ]
       );

  // bootstrap js (XXX replace this with sjs at some point)
  BUILD("modules/surface/bootstrap/bootstrap.min.js",
        ["cp $0 $TARGET"],
        ["src/deps/bootstrap/dist/js/bootstrap.min.js"]);

  BUILD("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.eot",
        ["cp $0 $TARGET"],
        ["src/deps/bootstrap/fonts/glyphicons-halflings-regular.eot"]);
  BUILD("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.svg",
        ["cp $0 $TARGET"],
        ["src/deps/bootstrap/fonts/glyphicons-halflings-regular.svg"]);
  BUILD("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.ttf",
        ["cp $0 $TARGET"],
        ["src/deps/bootstrap/fonts/glyphicons-halflings-regular.ttf"]);
  BUILD("modules/surface/bootstrap/fonts/glyphicons-halflings-regular.woff",
        ["cp $0 $TARGET"],
        ["src/deps/bootstrap/fonts/glyphicons-halflings-regular.woff"]);


  //----------------------------------------------------------------------
  // version stamping for module files and *.json:

  // helper to recursively read all files in given directory
  function walkdir(path, cb) {
    var files = @readdir(path);
    files .. @each { 
      |f|
      if (@isDirectory(path+"/"+f))
        walkdir(path+"/"+f, cb);
      else
        cb(path+"/"+f);
    };
  }


  BUILD("tmp/version_stamp",
        [
          function() {
            log("* version stamping");
            function replace_in(m) {
              if (/.+\.(sjs|txt|json|mho)$/.test(m)) {
                log('- Replacing version in '+m);
                replacements_from_config(m);
              }
            }
            walkdir("modules", replace_in);
            replace_in("package.json");
          },
          "touch $TARGET"
        ],
        ["src/build/config.json"]);

}

//----------------------------------------------------------------------
// specialized build tasks

var config;
function get_config() {
  if (!config)
    config = require('sjs:docutil').parseCommentedJSON(
      @readFile("src/build/config.json"));
  return config;
}

function replacements_from_config(target) {
  var config = get_config();
  var src = @readFile(target).toString();

  var repl = src.replace(/Version: '[^']*'/g, "Version: '"+config.version+"'")
                .replace(/"version"\s*:\s*"[^"]*"/, '"version" : "'+config.npm.version+'"')
                .replace(/"private"\s*:\s*[^,]*/, '"private" : '+config.npm['private']+'')
                .replace(/Conductance '[^']*' Standard Module Library/g, 
                         "Conductance '"+config.version+"' Standard Module Library");

  if (repl != src)
    @writeFile(target, repl);
}

//----------------------------------------------------------------------
// high-level builders

function CONCAT(target, files) {
  log("* Concatenating: "+target);
  var sh = "cat";
  for (var i=0; i<files.length; i++) sh += " $" + i;
  var deps = files.concat(["src/build/config.json"]);
  BUILD(target, [sh + " > $TARGET", replacements_from_config], deps);
}

//----------------------------------------------------------------------
// BUILD & PSEUDO:

var builders = {}, pseudos = {};

// BUILD: "builder construction function"
// Sets task and dependencies for a given target.
// task can be a shell command or a function
function BUILD(target, task, deps) {
  deps = deps || [];
  // builders are dependent on the buildscript itself:
  if (target !== "src/build/buildscript.sjs")
    deps.push("src/build/buildscript.sjs");
  
  // We only want to execute the builder once and return the memoized
  // result on subsequent invocations. By utilizing a stratum and
  // waitforValue(), we can additionally ensure that these semantics
  // also work when the builder is called concurrently while it is
  // still running:
  var stratum;
  builders[target] = function() {
    if (!stratum) {
      stratum = spawn _run_builder(target, task, deps);
    }
    return stratum.waitforValue();
  }
}

// PSEUDO: Mark given target as a pseudo-target; i.e. there is no
// corresponding disk file for it.
function PSEUDO(target) {
  pseudos[target] = true;
}


//----------------------------------------------------------------------
// implementation helpers: 

function log(s) { process.stdout.write(s+"\n"); }


function timestamp(target, istarget) {
  if (!pseudos[target]) {
    try {
      return @stat(target).mtime;
    }
    catch (e) { /* file doesn't exist yet */}
  }
  // non-existant file or pseudo.
  return istarget ? new Date(0) : new Date("2100");
}

function _run_builder(target, task, deps) {
  // first run dependencies:
  if (deps.length) {
    require('sjs:cutil').waitforAll(
      function(dep) {
        if (builders[dep]) 
          builders[dep]();
        else
          if (!/^src\//.test(dep)) // warn for missing builder if file is not in src/
            log('Warning: no builder for '+dep);
      },
      deps);
  }
  // check if we need to run the task:
  var ts = timestamp(target, true);
  var dirty = (deps.length == 0);
  for (var i=0; i<deps.length; ++i) {
    if (timestamp(deps[i]) >= ts) {
//      console.log('TARGET '+target+': '+deps[i]+' ('+timestamp(deps[i])+') > '+ts+' ('+i+')');
      dirty = true;
      break;
    }
  }
  // now run the build task:
  if (dirty) {
    try {
      _run_task(target, task, deps);
    }
    catch (e) {
      process.stderr.write("Error executing task for '"+target+"':"+e);
      throw e;
    }
  }
  return target;
}

function _run_task(target, task, deps) {
  if (Array.isArray(task)) {
    for (var i=0; i<task.length; ++i)
      _run_task(target, task[i], deps);
  }
  else if (typeof task == "function")
    task(target, deps);
  else if (typeof task == "string") {
    // we assume it's a shell command
    // do some replacements first:
    task = task.replace(/\$(\d+)/g, function(m,n) { return deps[n]; });
    task = task.replace(/\$TARGET/g, target);
    log("* Executing shell command: '"+task+"'");
    require('sjs:nodejs/child-process').exec(task);
  }
  else 
    throw new Error("Unknown task type in builder '"+target+"'");    
}

// Build the given target:
function build_target(target) {
  // make sure we're in the right path:
  var conductance_home = "#{module.id .. @toPath .. require('path').dirname}/../..";
  process.chdir(conductance_home);

  // make sure there's a tmp dir:
  if (!@isDirectory("tmp")) {
    log("Executing 'mkdir tmp'");
    @mkdir("tmp",0777);
  }

  try {
    build_deps();
    builders[target]();
  }
  catch(e) { process.stdout.write("\nBUILD ERROR\n"); process.exit(1); }
}

//----------------------------------------------------------------------
// main:

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
  var argv = @argv();
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
  console.log("\nBuilding target: " + target);
  build_target(target);
}

