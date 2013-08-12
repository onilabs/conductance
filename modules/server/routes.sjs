var { conductanceRoot, sjsRoot } = require('./env');
var { setStatus, writeRedirectResponse } = require('./response');
var { flatten } = require('sjs:array');
var { each, join } = require('sjs:sequence');
var { keys } = require('sjs:object');

//----------------------------------------------------------------------

function AddHeader(route, name, value) {
  flatten([route]) .. each {
    |r|
    if (!r.headers) 
      r.headers = {};
    r.headers[name] = value;
  }
  return route;
}
exports.AddHeader = AddHeader;

//----------------------------------------------------------------------

function AllowCORS(route) {
  AddHeader(route, "Access-Control-Allow-Origin", "*");

  flatten([route]) .. each {
    |r|
    // install a handler for preflight OPTIONS request:
    // xxx we should check if there is already an OPTIONS handler func defined
    // in r
    r.handler['OPTIONS'] = function(matches, req) {
      // preflight requests should be preventable by giving POST
      // requests a text/plain mime type
      console.log('Performance warning: preflight OPTIONS request.');
      req .. setStatus(200, 
                       {
                         "Access-Control-Allow-Origin": "*",
                         "Access-Control-Allow-Methods": keys(r.handler) .. join(', '),
                         "Access-Control-Allow-Headers": "origin, content-type"
                       });
      req.response.end();
    }
  }
  return route;
}
exports.AllowCORS = AllowCORS;

//----------------------------------------------------------------------

function SimpleRedirectRoute(path, new_base, status) {
  status = status || 302;
  return {
    path: path,
    handler: {
      '*': function(matches, req) {
        req .. writeRedirectResponse("#{new_base}#{matches[0]}#{req.url.query? "?#{req.url.query}":''}#{req.url.anchor? "##{req.url.anchor}":''}", status);
      }
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
    MappedDirectoryRoute(/^\/__sjs(\/.*)$/, "#{sjsRoot()}"),
    MappedDirectoryRoute(/^\/__mho(\/.*)$/, "#{conductanceRoot()}modules/"),
    {
      path: /__aat_bridge\/(2)$/,
      handler: require('mho:rpc/aat-server').createTransportHandler(
        function(transport) {
          require('mho:rpc/bridge').accept(
            require('./api-registry').getAPIbyAPIID,
            transport);
        })
    },
    {
      path: /__keyhole\/([^\/]+)\/(.*)$/,
      handler: require('./keyhole').createKeyholeHandler()
    }
  ];
}
exports.StandardSystemRoutes = StandardSystemRoutes;
