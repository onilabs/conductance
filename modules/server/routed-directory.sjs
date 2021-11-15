/* (c) 2013-2019 Oni Labs, http://onilabs.com
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
   @summary Internal support for serving routed frontend directories
   @hostenv nodejs
*/

@ = require([
  'sjs:std',
  {id:'../surface', name: 'surface'},
  '../surface/html',
  {id:'nodejs:path', name: 'path'},
  {id:'../surface/doc-fragment', name: 'doc_fragment'},
  {id:'./generator', include: ['CachedBundle']},
  {id:'sjs:lru-cache', name:'lruCache'},
  {id:'./api-registry', name:'api_registry'}
]);


/**
   @feature RoutedFrontendDirectory
   @summary Experimental 'routed frontend directories' feature
   @desc
     The 'routed frontend directory' can be used to serve on-disk 
     hierarchical collections of `index.container` and `*.page` files.
     
     A directory 'frontend' is served by conductance as a routed directory
     by adding a [./route::RoutedDirectory] to a [mho:#features/mho-file::]:

         @server.run([
           {
             address: @Port(8000),
             routes: [
               ...
               @route.RoutedDirectory(/^/\?/, require.url('./frontend/'));
             ]
           }
         ])

     Conductance will parse the directory into a hierarchical 
     [mho:surface/navigation::RoutingTable], mapping all 'index.container' and '*.page' 
     files into corresponding [mho:surface/navigation::Container] and 
     [mho:surface/navigation::Page] objects.

     When a client requests a file under the frontend directory, Conductance
     will serve a html file with some bootstrapping code that navigates to the 
     requested url with a (client-side) 
     call to [mho:surface/navigation::route]. The container/page hierarchy is served
     as described under [mho:surface/navigation::Container].

     Once any page under the frontend directory is served to the client, all 
     navigation within the directory (via e.g. [mho:surface/navigation::navigate] or
     [mho:surface/navigation::back]/[mho:surface/navigation::forward]) is performed
     on the client-side. Going forward, only sources that have not yet been loaded 
     will be requested from the server.

     #### frontend-config.yaml

     When parsing a routed directory, Conductance will look at the top level for a file
     `frontend-config.yaml` with the following optional settings:

     * `title`: Initial title to be displayed in browser tab (STRING)
     * `head`: Additional static html for the header (e.g. to load a font stylesheet) (STRING)
     * `init`: Additional code to execute on initial loading, and before starting
       the  routing process (e.g. code to map hubs) (STRING) 
     * `main`: Additional code to execute after starting the routing process (STRING)
     * `api`: Id of a backend module whose exported methods will be served as an api (as module '/api') (STRING)
     * `bundle`: Modules to parse for bundle dependencies - by default only the conductance 
       standard lib will be bundled (ARRAY OF STRINGS).

*/

//----------------------------------------------------------------------
// helpers
__js var isWildcardFile = file -> /^\[.*\]$/.test(file);
__js var wildcardFileToParam = file -> file.substring(1, file.length-1);
__js var paramToWildcardFile = param -> param ? "[#{param}]" : "[]";


//----------------------------------------------------------------------
/*
  parseDirectory:
    helper that parses the given directory and returns an object 

        { 
          paths: list_of_mapped_paths,
          tree: directory_tree,
          config: frontend_config,
          root: filesystem root of mapped directory
        }

    * list_of_mapped_paths is a list of [url,module,type] paths (type='page'|'container'). 'url' and 'module' are relative to
      the directory root and start with a '/' (i.e. '.' omitted)

    * directory_tree consists of nodes:

        NODE = {
          sub_dirs: {
            DIRNAME: NODE,
            ...
          },
          wildcard_dir?: {
            param: PARAM_NAME,
            dir: NODE
          },
          pages: {
            // must not contain 'index' entries; these are handled in file-server
            BASENAME: {}
          },
         file: {
           // all regular files in the given directory (also pages, but with extension this time):  
           FILENAME: {}
         }
       }

    * frontend_config is the parsed content of the frontend-config.yaml file (or undefined, if no such file)
      

*/
function parseDirectory(root_dir) {

  var paths = [];

  function traverse(root, dir) {
    var node = { sub_dirs:{}, pages:{}, files:{} };
    
    @fs.readdir(@path.join(root, dir)) .. @each {
      |file|
      if (@fs.isDirectory(@path.join(root, dir, file))) {
        if (file .. isWildcardFile) {
          if (node.wildcard_dir) throw new Error("Multiple parametrized directories in #{dir}");
          node.wildcard_dir = { dir: traverse(root, @path.join(dir,file)) };
          if (file.length > 1)
            node.wildcard_dir.param = file .. wildcardFileToParam;
        }
        else {
          node.sub_dirs[file] = traverse(root, @path.join(dir,file));
        }
      }
      else /* file assumed */ {
        if (/^.*\.page$/.test(file)) {
          if (file === 'index.page') {
            paths.push([@path.join(dir,'/'), @path.join(dir, file), 'page']);
          }
          else {
            node.pages[file.substring(0, file.length-5 /* to strip '.page' */)] = {};
            paths.push([@path.join(dir,file.substring(0, file.length-5 /* to strip '.page' */)),
                                   @path.join(dir, file), 'page']);
          }
        }
        else if (file === 'index.container') {
          paths.push([@path.join(dir,'/'), @path.join(dir,file), 'container']);
        }
        // note - we need this for *all* files, so that we don't spuriously resolve wildcard directories (we ignore trailing slash):
        node.files[file] = {};
      }
    }
    return node;
  }

  var config = {
    title: 'Conductance App',
    head: undefined,
    main: undefined,
    init: undefined,
    bundle: [],
    api: undefined
  };

  var frontend_config_file = @path.join(root_dir, 'frontend-config.yaml');

  if (@fs.isFile(frontend_config_file)) {
    var config_file = frontend_config_file;
    config = config .. @override(@fs.readFile(config_file, 'utf8') .. require('sjs:yaml').safeLoad);
  }

  // make sure relative api urls are resolved relative to root_dir:
  if (config.api) {
    config.api = @url.normalize(config.api, @url.coerceToURL(frontend_config_file));
    // (re-)register api 
    // we register under the module name instead of an automatically generated apiid, so 
    // that we can skip the *.api!json resolution step (less client<->server traffic):
    @api_registry.registerAPI(config.api, config.api);
  }

  return {paths: paths, tree: traverse(root_dir, '/'), config: config, root: root_dir};

}

function RoutedDirectory(path, root, overrides) {

  if (arguments.length === 1) {
    root = path;
    path = /^/;
  }

  root = @fs.realpath(root .. @url.coerceToPath);

  var {createDirectoryMapper} = require('./route');
  var formats = require('./formats');

  // XXX parseDirectory should be memoized; in devel we should watch the directory (and subdirs)
  var directoryMapping = -> parseDirectory(root);

  // call directoryMapping() now so that any api gets registered and already running clients can connect to it
  // (important on server restart while clients are running):
  directoryMapping();

  var RoutedDirectoryMapper = createDirectoryMapper({
    allowGenerators: true,
    allowREST:       true,
    allowApis:       true,
    directoryMapping: directoryMapping,
    formats: formats.StaticFormatMap .. formats.Code() .. formats.Executable() .. formats.Routed()
  });

  return RoutedDirectoryMapper(path, root, overrides);
}
exports.RoutedDirectory = RoutedDirectory;

//----------------------------------------------------------------------
// used in file-server to map parametrized path components (directories like '[foo]')
function resolveParametrizedPath(path, settings) {
  //console.log("TO RESOLVE = #{path}");

  var dir_components = path.split('/');

  if (dir_components[dir_components.length-1] === '') {
    // the resolved path had a trailing slash... let's only resolve to before the slash, 
    // so that foo/ gets mapped to file 'foo' if there is one
    dir_components.pop();
  }

  var resolved_dir_components = [];

  var dir_node = settings.directoryMapping().tree;
  dir_components .. @indexed .. @each {
    |[i,component]|
    if (!component) continue;
    if (!dir_node) {
      resolved_dir_components.push(component);
    }
    else if (dir_node.sub_dirs.hasOwnProperty(component)) {
      resolved_dir_components.push(component);
      dir_node = dir_node.sub_dirs[component];
    }
    else if (dir_node.pages.hasOwnProperty(component) && i === dir_components.length-1) {
      resolved_dir_components.push(component+'.page');
      break;
    }
    else if (dir_node.files.hasOwnProperty(component) && i === dir_components.length-1) {
      resolved_dir_components.push(component);
      break;
    }
    else if (dir_node.wildcard_dir) {
      resolved_dir_components.push(paramToWildcardFile(dir_node.wildcard_dir.param));
      dir_node = dir_node.wildcard_dir.dir;
    }
    else {
      //console.log("PATH NOT MAPPED AT '#{component}' >>"+dir_node .. @inspect);
      // this path is not mapped
      dir_node = null;
      resolved_dir_components.push(component);
    }
  }
  
  var resolved = resolved_dir_components.join('/');

  //console.log("RESOLVED = #{resolved}");
  return resolved;
  
}
exports.resolveParametrizedPath = resolveParametrizedPath;

//----------------------------------------------------------------------

var BuiltinModule = (content, name) ->  
  @Script .. 
    @surface.Attrib('type', 'text/sjs') ..
    @surface.Attrib('module', name) ::
      content;


var MappingPathToRoutingTablePath = (mp) -> mp.replace(/\[([^\]]*)\]/g, ':$1').replace(/\'/g, "\\'");

exports.gen_routed_page = function(src, aux) {

  var mapping = aux.directoryMapping();

  // console.log("URL PREFIX=#{aux.request.strippedURLPrefix}");

  var bundle = @Script .. @surface.Attrib('src', @path.join('/', aux.request.strippedURLPrefix, 'frontend-config.yaml!bundle'));

  var builtin_modules = [];

  var yaml_url_root = aux.request.url.protocol+"://"+aux.request.url.authority+"/"+(aux.request.strippedURLPrefix ? aux.request.strippedURLPrefix + "/" : "");

  if (mapping.config.init) {
    builtin_modules.push(
      BuiltinModule(yaml_url_root + "__inline_init__.sjs") :: [
        mapping.config.init
      ]
    );
  }
  if (mapping.config.main) {
    builtin_modules.push(
      BuiltinModule(yaml_url_root + "__inline_main__.sjs") :: [
        mapping.config.main
      ]
    );
  }

  if (mapping.config.api) {
    builtin_modules.push(
      BuiltinModule('backend:api') ::
        `
        @ = require([
          'sjs:std',
          {id: 'mho:surface/api-connection', name: 'api_connection'}
        ]);
        @runGlobalBackgroundService(@api_connection.withAPI,
                                    {id: '${mapping.config.api}'})[0] ..
        @ownPropertyPairs .. @each {
          |[key,val]|
          exports[key] = val;
        }
        `
    );
  }

  var initCode = [
    mapping.config.main || mapping.config.init ? `require.hubs.push(['frontend-config.yaml:', '${yaml_url_root}']);`,
    mapping.config.init ? `require('frontend-config.yaml:__inline_init__');`,
    `
    @ = require([{id:'sjs:sys', include:['spawn']}, 'mho:surface/navigation']);
    @spawn(-> @route([${
      mapping.paths .. 
        @map([path, module, type] ->
             type === 'page' ?
             "@Page('#{@path.join('/',aux.request.strippedURLPrefix,MappingPathToRoutingTablePath(path))}',ctx->require(\'#{@path.join('/',aux.request.strippedURLPrefix,module)}\').content(ctx))" :
             "@Container('#{@path.join('/',aux.request.strippedURLPrefix,MappingPathToRoutingTablePath(path))}',ctx->require(\'#{@path.join('/',aux.request.strippedURLPrefix,module)}\').content(ctx))") ..
        @join(',')
    }]));
    `,
    mapping.config.main ? `require('frontend-config.yaml:__inline_main__');`
  ];
 
  var content = [
    `<!DOCTYPE html>`,
    @Html :: [

      @Head :: [
        mapping.config.head ? @surface.RawHTML :: mapping.config.head,
        @Title :: mapping.config.title,
        bundle,
        builtin_modules,
        @doc_fragment.configure({serverRoot:aux.request.url.protocol+"://"+aux.request.url.authority+"/"}).initializeRuntime(initCode)
      ],
      
      @Body :: [
//        @Pre :: mapping .. @inspect(false, 10)
      ]        
    ]
  ];

  return (content .. @surface.collapseHtmlFragment).getHtml();

};

//----------------------------------------------------------------------
// bundling

// XXX this should go elsewhere
// XXX see also the separate bundle caching in formats.sjs
var bundleCache = @lruCache.makeCache(10*1000*1000); // 10MB

function getBundleSettings(path, url, directoryMapping) {
  var pathUrl = @url.normalize('./', path .. @url.fileURL);
  var defaultSettings = {
    resources: [
      // Assume relative paths are co-located.
      // This will not work if .app files import paths from their parent,
      // but we can't handle that in the general case without deep knowledge of routes.
      [pathUrl, @url.normalize('./', url.source)],
    ],
    allowedPaths: [
      require.url('sjs:'),
      require.url('mho:'),
      pathUrl
    ],
    configFile: path .. @url.coerceToPath, // we're passing in the yaml config file name for use in the etag generation by ./generator.sjs; see comment below (XXX this is a bit ugly)
    skipFailed: true,
    compile: true,
    root: pathUrl
  };
  //console.log(defaultSettings .. @inspect);
  var appSettings = defaultSettings; /*@env.get('bundleSettings', defaultSettings); */

  /*
  var docutil = require('sjs:docutil');
  
  var [_, sourceSettings] = @fs.readFile(path)
    .. docutil.parseModuleDocs()
    .. docutil.getPrefixedProperties('bundle');
  
  var settings = appSettings .. @merge(sourceSettings, { sources: [pathUrl] });
  */

  // XXX this is a bit ugly; we don't want to include frontend-settings.yaml in the bundle; but we *do*
  // want to regenerate the bundle whenever this file is modified. So we need to make sure the modification
  // date enters into the bundle's etag creation (see 'configFile: path .. @url.coerceToPath' above) and we 
  // need to make sure that the bundle's internal refresh mechanism sees the sources as specified in the current 
  // config file. To ensure the latter, we pass the sources in as an observable (the bundle code - or rather generator.js::refresh) knows how to deal with this: 
  var sources = @Stream(function(r) {
    var config = directoryMapping().config;
    var deps = config.bundle;
    if (config.api) {
      deps.push('mho:surface/api-connection');
    }
    r(['mho:std', 'mho:surface/navigation'].concat(deps));
  });

  var settings = appSettings .. @merge({sources: sources});

  return settings;
};


function bundleAccessor(path, directoryMapping) {
  @assert.ok(path);
  var get = bundleCache.get(path);
  if (!get) {
    // serialize requests for the given path, as we don't
    // want to regenerate the same bundle in parallel
    get = (function() {
      var b;
      return @fn.sequential(function(url) {
        if (!b) {
          b = @CachedBundle(getBundleSettings(path, url, directoryMapping));
        } else if (b.isStale(false)) {
          b.modifySettings(getBundleSettings(path, url, directoryMapping));
        }
        return b;
      });
    }());
    bundleCache.put(path, get, 0);
  }
  return get;
};

function gen_frontend_bundle(src, aux) {
  //console.log(aux.request);
  var getBundle = bundleAccessor(aux.filepath, aux.directoryMapping);
  var bundle = getBundle(aux.request.url);
  var content = bundle.content();
  // overwrite cache entry each time to update cache length
  bundleCache.put(aux.filepath, getBundle, content.length);
  return [content];
};
exports.gen_frontend_bundle = gen_frontend_bundle;


function gen_frontend_bundle_etag(request, filePath, aux) {
  return bundleAccessor(filePath, aux.directoryMapping)(request.url).etag();
}
exports.gen_frontend_bundle_etag = gen_frontend_bundle_etag;
