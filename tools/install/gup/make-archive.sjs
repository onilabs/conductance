#!/usr/bin/env sjs

@ = require('sjs:std');
@stream = require('sjs:nodejs/stream');
@nodeFs = require('nodejs:fs');
var [dest, name] = @argv();
var { run } = require('./common');
var [basename, ext] = @path.basename(name) .. @split('.', 1);

;[basename, ext] .. @each(@assert.ok);
var root = process.cwd();

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

var tree = "tmp/#{basename}";
var ls = -> @fs.readdir('.');
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
    var z = root + "/dist/7z";
    run("gup", "-u", z);
    intree {||
      run.apply(null, [z, "a", "-y", dest].concat(ls()));
    }
    break;

  case 'exe':
    var confFiles = @fs.readdir("conf");
    var confPaths = confFiles .. @map(f -> @path.join("conf", f));
    var payload = (name .. @rsplit(".", 1))[0] + ".7z";
    run.apply(null, ["gup", "-u", payload].concat(confPaths));

    var out = @nodeFs.createWriteStream(dest, 'w');
    ;[root+"/conf/7zS.sfx", root+"/conf/7zip.conf", root+"/" + payload] .. @each {|input|
      var inf = @nodeFs.createReadStream(input);
      inf .. @stream.pump(out);
    }
    out.close();
    break;
  
  default:
    throw new Error("unknown archive type: #{ext}");
}
