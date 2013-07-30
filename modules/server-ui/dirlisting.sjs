// XXX get rid of bootstrap dependency
var { Bootstrap, Container, Label, Icon } = require('../surface/bootstrap');
var { transform } = require('sjs:sequence');
var url = require('sjs:url');

// helper to format file sizes:
function formatBytes(size) {
  if (size < 1024)
    return `$size B`;
  else if (size < 1024*1024)
    return `${Math.round(size/1024*10)/10} kB`;
  else
    return `${Math.round(size/1024/1024*10)/10} MB`;
}


/**
   @function generateDirListing
   @param {Object} [dir] Object describing directory
   @return {HtmlFragment}
*/
exports.generateDirListing = function(dir) {

  var folders = dir.directories .. 
    transform(d -> `<div>$Icon('folder-close-alt') <a href="${url.encode(d)}/">$d/</a></div>`);
  
  var files = dir.files ..
    transform(f -> `<div>$Icon('file') <a href="${url.encode(f.name)}">${f.name}</a>
                        (${f.generated ? 
                           'generated' :
                           formatBytes(f.size)})
                    </div>`);

  return Bootstrap(Container(
    `
      <h1>$Icon('folder-open-alt') ${dir.path}</h1>
      <hr>
      <div class='row'>
        <div class='span6'>
          $folders
        </div>
        <div class='span6'>
          $files
        </div>
      </div>
      <hr>
      <p class='text-right'><small>℧ oni labs conductance server</small></p>
    `));
};
