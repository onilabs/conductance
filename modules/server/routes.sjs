var { conductanceRoot } = require('mho:server/env');

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
    MappedDirectoryRoute(/^\/__apollo(\/.*)$/, "#{conductanceRoot()}/apollo/")
  ];
}
exports.StandardSystemRoutes = StandardSystemRoutes;