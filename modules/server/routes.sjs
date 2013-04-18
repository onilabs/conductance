var { conductanceRoot } = require('./env');
var { writeRedirectResponse } = require('./response');

//----------------------------------------------------------------------

function SimpleRedirectRoute(path, new_base, status) {
  status = status || 302;
  return {
    path: path,
    handler: function(matches, req) {
      req .. writeRedirectResponse("#{new_base}#{matches[0]}", status);
    }
  }
}
exports.SimpleRedirectRoute = SimpleRedirectRoute;

//----------------------------------------------------------------------

function MappedDirectoryRoute(path, root) {
  return {
    path: path,
    handler: require('./file-server').MappedDirectoryHandler(root)
  }
}
exports.MappedDirectoryRoute = MappedDirectoryRoute;

//----------------------------------------------------------------------

function StandardSystemRoutes() {
  return [
    MappedDirectoryRoute(/^\/__sjs(\/.*)$/, "#{conductanceRoot()}apollo/"),
    MappedDirectoryRoute(/^\/__mho(\/.*)$/, "#{conductanceRoot()}modules/")
  ];
}
exports.StandardSystemRoutes = StandardSystemRoutes;