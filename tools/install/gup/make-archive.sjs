#!/usr/bin/env sjs

@ = require('sjs:std');
var [dest, name] = @argv();
var { run } = require('./common');
var [basename, ext] = @path.basename(name) .. @split('.', 1);

;[basename, ext] .. @each(@assert.ok);

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

  // TODO: .7z:
  // gup -u ./dist/7z
  // (cd tmp/"$2" && 7z a -y "$1" *)
  //
  // TODO: .exe:
  // gup -u conf/* "$base.7z"
  // cat conf/7zS.sfx conf/7zip.conf "$2.7z" > "$1"
  
  default:
    throw new Error("unknown archive type: #{ext}");
}
