/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @summary Client-side URL routing and navigation
   @hostenv nodejs
 */

@ = require(['sjs:std', './dynamic']);

//----------------------------------------------------------------------
// global state:

var global_routing_tree = {};
var global_error_route = {};

// [ {name, node, param?, params, content}, ... ]
var global_active_node_path = [];

//----------------------------------------------------------------------
// ROUTING TREE CONSTRUCTION:

/*

The routing table is processed into a routing tree, e.g.:

    [
      Container('/', funcA),
      Page('/user/:name/',  funcB),
      Page('/user/:name/config', funcC),
      Page('/user/:name/artboards', funcD),
      Page('/artboard/:id', funcE)
    ]

becomes:

  routes: {
    "" : {
      container: { content: funcA },
        routes: {
          'user' : {
            routes: {
              '*' : {
                param: 'name',
                page: { content: funcB, slash: true },
                routes: {
                  config: { 
                    page: { content: funC, slash: false }
                  },
                  artboards: {
                    page: { content: funcD, slash: false }
                  }
                }
              }
            }
          },
          'artboard' : {
            routes: {
              '*' : {
                param: 'id',
                page: { content: funcE, slash: false }
              }
            }
          }
        }
     }
  }

Note: 
  - '/' is stored as "" in the routing tree - all routes are rooted in it.
  - Page('*') is the special 'catch all route' which is stored separately in global_error_route

*/
// construct global routing tree & global error route:
function processRoutingTable(routing_table) { 
  var tree = {};

  routing_table .. @each {
    |[path, descriptor]|
    var path_arr = path .. @rstrip('/') .. @split('/');
    if (path_arr.length === 1 && path_arr[0] === '*') {
      // catch-all error route
      descriptor .. @ownPropertyPairs .. @each {
        |[key, value]|
        if (global_error_route[key]) throw new Error("Multiple #{key}s in routing table for route #{path}");
        global_error_route[key] = value;
      }
      continue;
    }

    // all routes apart from the catch-all error route must start with a slash:
    if (path[0] !== '/') 
      throw new Error("Invalid route '#{path}' in routing table. Routes must start with '/'.");

    var node = path_arr .. @reduce(tree, makeRoutingNode);
    descriptor .. @ownPropertyPairs .. @each {
      |[key, value]|
      if (node[key]) throw new Error("Multiple #{key}s in routing table for route #{path}");
      node[key] = value;
    }
  }

  global_routing_tree = tree;
}

function makeRoutingNode(parent, name) {
  var node_name;
  var is_wildcard;
  if (name .. @startsWith(':')) {
    // match all
    node_name = '*';
    name = name.substr(1);
    is_wildcard = true;
  }
  else {
    node_name = name;
    is_wildcard = false;
  }

  if (parent.routes === undefined) 
    parent.routes = {};
  parent = parent.routes;

  var node = parent[node_name];
  if (node) {
    if (is_wildcard) {
      if (node.param !== name)
        throw new Error("Inconsistent route parameter names in routing table: :#{name} != :#{node.param}");
    }
  }
  else {
    node = parent[node_name] = {};
    if (is_wildcard) {
      node.param = name;
    }
  }

  return node;
}

//----------------------------------------------------------------------
// navigation

// map the path array to an array of descriptors {node, param?} in the global routing tree
function getNodePath(path_arr) {
  var node_path = [];
  var current_node = global_routing_tree;
  path_arr .. @each {
    |route_name|
    if (!current_node.routes) return undefined;
    if (current_node.routes[route_name]) {
      current_node = current_node.routes[route_name];
      node_path.push({node: current_node});
    }
    else if (current_node.routes['*']) {
      current_node = current_node.routes['*'];
      node_path.push({node: current_node, param: route_name});
    }
    else return undefined;
  }
  if (!current_node.page) return undefined;
  return node_path;
}

// navigate to the given url
// settings:
//  omit_state_push: don't make history entry
//  enable_not_found_route: if url has the correct origin, but is not found, invoke the global_error_route (otherwise return false)
//  event: event that initiated the navigation; '@preventDefault()' will be called on it if the url is navigatable.
function navigate(url, settings) {
  settings = {
    omit_state_push: false,
    enable_not_found_route: false,
    event: undefined
  } .. @override(settings);

  url = url .. @url.normalize(location.href);
  if (!url .. @url.isSameOrigin(location.origin)) {
    //console.log("NOT SAME ORIGIN: #{url} and #{location.origin}");
    return false;
  }
  else if (settings.event) {
    // to be effective, we need to do this before doing anything async:
    settings.event .. @preventDefault();
  }
  url = url .. @url.parse;

  var path_arr = url.path .. @rstrip('/') .. @split('/');
  
  var node_path = getNodePath(path_arr);
  if (node_path === undefined) {
    if (settings.enable_not_found_route && global_error_route.page) {
      // XXX this should really not be hardcoded here
      node_path = [ 
        {
          node: global_routing_tree.routes['']
        },
        {
          node: global_error_route
        }
      ];
    }
    else
      return false;
  }

  // find part of node_path that is already active:
  for (var i=0; i<global_active_node_path.length; ++i) {
    if (node_path.length === 0) {
      break; // global_node_path is at a sub route of node_path
    }
    else if (global_active_node_path[i].node === node_path[0].node &&
        global_active_node_path[i].param === node_path[0].param) {
      // this node is already active; don't execute it again:
      node_path.shift();
    }
    else {
      // we're diverging from the active node path:
      break;
    }
  }
  // we've got the following cases now:
  // (1) i === global_active_node_path.length
  //    (a) node_path.length == 0 // -> path is already set; bail
  //    (b) node_path.length > 0 // install nodes onto active_node_path  and page at final one
  // (2) i < global_active_node_path.length
  //    (a) node_path.length == 0 // remove global_active_node_path[i..end]; install page at global_active_node_path[i-1]
  //    (b) node_path.length > 0 // remove global_active_node_path[i..end]; install nodes onto active_node_path and page at final one

  if (node_path.length === 0 && i === global_active_node_path.length) return true; // (1) (a)

  if (i < global_active_node_path.length)
    global_active_node_path = global_active_node_path.slice(0, i);

  var insertion_node = global_active_node_path[global_active_node_path.length-1];

  // The `content` functions of the individual nodes are potentially asynchronous. 
  // To prevent retraction from leaving us with half-baked content, inserting the new 
  // content into insertion_node's `content` observable has to be the last thing we do.
  // We could construct the new node tree from the top down, but (for historical reasons) 
  // here we construct it from the bottom up and move the `content` observable out of the
  // way temporarily, and then set the 'real' observable at the very bottom of this function.
  // see also the comment there.
  var old_content = insertion_node.content;
  var new_content = @ObservableVar();
  insertion_node.content = new_content;

  var prev_node_descriptor = insertion_node;
  // install inner nodes
  node_path .. @each { 
    |node_descriptor|

    var content;
    if (node_descriptor.node.container) {
      content = @ObservableVar();
      var ctx = {content: content, params: node_descriptor.params};
      prev_node_descriptor.content.set(node_descriptor.node.container.content(ctx));
    }
    else {
      content = prev_node_descriptor.content;
    }

    // splice in our path parameter (if any)
    var params = prev_node_descriptor.params;
    if (node_descriptor.node.param) {
      params = params .. @clone;
      params[node_descriptor.node.param] = node_descriptor.param .. decodeURIComponent;
    }

    var node_descriptor =       {
      node: node_descriptor.node,
      param: node_descriptor.param,
      params: params,
      content: content
    };


    global_active_node_path.push(node_descriptor);

    prev_node_descriptor = node_descriptor;
  }

  var page_node_descriptor = global_active_node_path[global_active_node_path.length-1];
  var ctx = {params: page_node_descriptor.params};
  page_node_descriptor.content.set(page_node_descriptor.node.page.content(ctx));

  if (!settings.omit_state_push)
    history.pushState(null, '', url);

  // possibly amend the url depending on whether we expect a '/' or not:
  if (page_node_descriptor.node.page.slash != url.path .. @endsWith('/')) {

    var amended_url = url.path;
    if (page_node_descriptor.node.page.slash)
      amended_url += '/';
    else
      amended_url = amended_url .. @rstrip('/');

    if (url.query)
      amended_url += "?#{url.query}";

    if (url.anchor)
      amended_url += "##{url.anchor}";

    history.replaceState(null, '', amended_url);
  }

  // We need to do this last (after performing the history push) to prevent a 
  // retraction if the navigation is performed by a mechanism attached to the 
  // ui that is being removed (e.g. an OnClick handler). See also the comment at the
  // declaration of insertion_node, above.
  insertion_node.content = old_content;
  old_content.set(new_content .. @current);
  return true;
}

//----------------------------------------------------------------------
// link and browser navigation button helpers:

function captureLinks() {
  document .. 
    @events("!click") .. @each {
      |ev|
      if (ev.target.tagName !== 'A' || ev.target.hasAttribute('download')) continue;
      navigate(ev.target.href, {event: ev});
    }
}

function dispatchStateChanges() {
  window ..
    @events("popstate") ..
    @each {
      |ev|
      navigate(location.href, {omit_state_push:true, enable_not_found_route: true, event: ev});
    }
}

//----------------------------------------------------------------------
// top-level driver:

function route(routing_table, settings) {

  settings = {
    DOMParent: document.body
  } .. @override(settings);

  processRoutingTable(routing_table);

  // install root into global_active_node_path:
  var root_node = global_routing_tree.routes[''];
  var root_content = @ObservableVar();

  var content;
  if (root_node.container) {
    content = @ObservableVar();
    root_content.set(root_node.container.content({content: content
                                                 }));
  }
  else 
    content = root_content; 

  // to ensure that `navigate` doesn't wrongly bail when the initial navigation is to '/', we 
  // have to ensure that the initial active node path isn't equal to '/'.
  // XXX it's a bit hackish, but for now, let's just push a dummy_node in addition to '/':
  var dummy_node = { node: {} };
  
  global_active_node_path = [ { node: root_node, content: content, params:{} }, dummy_node ];

  // navigate to initial page:
  if (!navigate(location.href, {omit_state_push: true, enable_not_found_route: true})) {
    throw new Error("Invalid location #{location.href}");
  }

  // append to document and wait for state changes:

  settings.DOMParent .. @appendContent(root_content) { 
    || 
    waitfor {
      captureLinks();
    }
    or {
      dispatchStateChanges();
    }
  }
}

//----------------------------------------------------------------------
// TOP-LEVEL API

/**
  @function route
  @summary Install a global routing table and perform client-side routing urls
  @param {::RoutingTable} [routing_table] Table of routes to install
  @param {optional Object} [settings]
  @setting {DOMNode} [DOMParent=document.body] DOM parent to which routed content will be appended
  @desc
     This function performs global routing for an application, appending content to the document's body and swapping it 
     out when navigating between different URLs. It should be called exactly once. 
     It doesn't return unless aborted.

     While a call to `route(routing_table)` is active, clicks on links and browser back/forward events will automatically be
     routed according to the definitions in `routing_table`. Programmatically, [::navigate], [::back], and [::forward] can
     be used to navigate to different URLs.
     
     When routing clicks on links, the default action of the link will be supressed if the url is found 
     in the routing table and can be routed. 

     When initially calling `route()`, the application will be routed to `window.location`. If this doesn't map to a route, 
     the 'catch all route' (`Page('*', ...)`) will be invoked.

     Note that the 'catch all route' will **NOT** be invoked when processing links or calls to [::navigate]. In the case of 
     links, the default event action will typically lead to a request to the server being issued. This is by design, so that
     server-side content that is not part of the application can be navigated to. If the content is not found on the server, and
     the application is served (e.g. by virtue of being a wildcard `_.app` that captures non-existing urls) again, then the
     renewed invocation of `route()` will cause the 'catch all route' to be executed.
*/
exports.route = route;

/**
   @class RoutingTable
   @summary Array of global URL routes; parameter to [::route]
   @desc
     An array of [::Page] and [::Container] objects that define how URLs are routed on the client-side.
*/

/**
   @class PathPattern
   @summary A string describing the path of a route ([::Container] or [::Page])
   @desc
     * PathPatterns must be **absolute** paths (starting with '/').
     * PathPatterns can be parameterized with path components starting with a colon (':').
     * Parameterized path components are made available to the route's 'context' (see [::Container], [::Page])

     #### Example:

         '/employee/:name/details' 

         // matches urls with arbitrary ':name' component, e.g.:

         '/employee/Tom%20Ford/details' // 'Tom Ford' (note unescaped '%20') 
                                        // made available in context as 
                                        // `context.params.name`

*/

/**
   @class Container
   @function Container
   @param {::PathPattern} [path] Path of this route 
   @param {Function} [content] Content function
   @summary A [::RoutingTable] element for content common to sub routes
   @desc
     Containers form a nesting structure along the active route path for defining common content that stays in the DOM
     when navigating between sub routes. 

     A container's `content` function is called with a `context` argument:

         {
           params:  {...},        // Hash of path parameters
           content: HtmlFragment  // Content of sub route
         }

     It is expected to return a [mho:surface::HtmlFragment].

     E.g. for the following routing table:

         [ 
           Container('/', ctx -> `<pre>${ctx.content}</pre>`),
           Container('/bar/', ctx -> `<b>${ctx.content}</b>`),
           Page('/foo', ctx -> 'foo'),
           Page('/bar/baz/', ctx -> 'bar')
         ]

    the DOM for the respective paths '/foo' and '/bar/baz/' will look like this:

         <pre>foo</pre>

         <pre><b>bar</b></pre>
     
*/
exports.Container = (path, content) -> [path, { container: { content: content } }];

/**
   @class Page
   @function Page
   @param {::PathPattern} [path] Path of this route 
   @param {Function} [content] Content function
   @summary A [::RoutingTable] element that defines the page content for the given path
   @desc

     A Page's `content` function is called with a `context` argument:

         {
           params:  {...}        // Hash of path parameters
         }

     It is expected to return a [mho:surface::HtmlFragment].

     See [::Container] for an example routing table.

     Note that a route ending in a slash (e.g. '/foo/bar/') also captures paths that don't end in a slash (e.g. '/foo/bar'), 
     and the browsers location will be amended accordingly. Similarly routes defined without
     a trailing slash also capture paths containing a trailing slash.


     ### Special 'catch all' route

     The page `Page('*', ...)` contains the content that should be shown when the router cannot find a route that is being navigated to. For more detail on when this is being shown, see [::route].
*/
exports.Page = (path, content) -> [path, { page: { content: content, slash: path .. @endsWith('/') } }];

/**
   @function navigate
   @summary Navigate to the given URL
   @param {String} [url] URL to navigate to
   @desc
     If `url` refers to one of the routes known by the global routing table, the associated page will be shown,
     the browser's URL history changed accordingly, and `true` returned.
     Otherwise `false` will be returned.
     Note that no attempt will be made to fetch the URL via the network (in contrast to clicks on links - see [::route]).
   
*/
exports.navigate = navigate;

/**
  @function back
  @summary Navigate to previous page in the history
  @desc
    Equivalent to `window.history.back()`
*/
exports.back = -> window.history.back();

/**
  @function forward
  @summary Navigate forward in the history
  @desc
    Equivalent to `window.history.forward()`
*/
exports.forward = -> window.history.forward();
