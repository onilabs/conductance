#!../../../node_modules/stratifiedjs/sjs

@ = require('sjs:std');
@stream = require('sjs:nodejs/stream');
@nodeFs = require('nodejs:fs');
var [dest, name] = @argv();
var { run } = require('./common');
var [basename, ext] = @path.basename(name) .. @split('.', 1);

;[basename, ext] .. @each(@assert.ok);
var root = process.cwd();

if (ext == 'exe') {
  // since users see the names of windows .exes, we name them
  // Conductance-{arch}.exe
  [platform, arch]  = basename .. @split('-', 1);
  platform .. @assert.eq('Conductance');
  
  // but we're building the tree named windows_{arch}:
  basename = "windows_#{arch}";
}

var tree = "tmp/#{basename}";
var ls = -> @fs.readdir('.');
function indir(dest, block) {
  @info("# (in #{dest})");
  var init = process.cwd();
  try {
    process.chdir(dest);
    block();
  } finally {
    process.chdir(init);
  }
}

function intree(blk) {
  run("gup", '-u', tree);
  indir(tree, blk);
}

switch(ext) {
  case 'tar.gz':
    intree {||
      run.apply(null, ["tar", "zcf", dest].concat(ls()));
    }
    break;
  case 'zip':
    intree {||
      run.apply(null, ["zip", "-qr", dest].concat(ls()));
    }
    break;

  case '7z':
    var z = root + "/dist/7za";
    run("gup", "-u", z);
    intree {||
      run.apply(null, [z, "a", "-y", dest].concat(ls()));
    }
    break;

  case 'exe':
    var confFiles = @fs.readdir("conf");
    var confPaths = confFiles .. @map(f -> @path.join("conf", f));
    var payload = @path.join(@path.dirname(name), basename + '.7z');
    var prelude = "dist/7zsd.sfx";
    run.apply(null, ["gup", "-u", payload, prelude].concat(confPaths));

    var out = @nodeFs.createWriteStream(dest, 'w');
    ;[root+"/" + prelude, root+"/conf/7zip.conf", root+"/" + payload]
      .. @transform(@fs.fileContents)
      .. @concat
      .. @stream.pump(out);
    break;
  
  default:
    throw new Error("unknown archive type: #{ext}");
}
