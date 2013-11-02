@ = require(['mho:stdlib', {id:'mho:surface/bootstrap/html', exclude:['Map','Style'] }]);

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
    @transform(d -> `<div>$@Icon('folder-close') <a href="${@url.encode(d)}/">$d/</a></div>`);
  
  var files = dir.files ..
    @transform(f -> `<div>$@Icon('file') <a href="${@url.encode(f.name)}">${f.name}</a>
                        (${f.generated ? 
                           'generated' :
                           formatBytes(f.size)})
                    </div>`);

  return  `
      $@H1(`$@Icon('folder-open')&nbsp;${dir.path}`)
      <hr>
      $@Row([@ColSm(6, folders), @ColSm(6, files)])
      <hr>
      <p class='text-right'><small>℧ oni labs conductance server</small></p>
    `;
};
