/* (c) 2013-2017 Oni Labs, http://onilabs.com
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
  @summary Services Management
  @desc
    A central point for configuring, starting and stopping application services
*/

var modules = ['mho:std',
               {id:'mho:flux/kv', name:'kv'}
              ];

if (require('sjs:sys').hostenv === 'xbrowser') {
  modules = modules.concat(
    {id:'mho:surface/field', name: 'field'}, 
    'mho:surface/components', 
    'mho:surface/html', 
    {id:'sjs:marked', name:'marked'}
  );
}

@ = require(modules);

//----------------------------------------------------------------------

/**
   @class ServicesRegistry
   @summary Object keeping track of services configuration data
   @desc
      There is a well-known global services registry which is used by [::withServices] and [::withService]. It needs to be initialized before use with [::initGlobalRegistry].
   @variable ServicesRegistry.kvstore
   @summary [./flux/kv::KVStore] Key-Value store holding provisioning data for registered services
   @variable ServicesRegistry.instances 
   @summary Hash of `instance_name: service_descriptor`.
*/
var gServicesRegistry;

var gRunningInstances = {};

/**
   @function ServicesRegistry
   @param {Object} [service_instances] Hash of services to register
   @param {optional ./flux/kv::KVStore} [provisioning_store] Key-value store for holding provisioning data
   @desc
      `provisioning_store` will typically be a persistent [./flux/kv::LocalDB] configuration database that is encrypted ([./flux/kv::Encrypted]).

      `service_instances` is a hash of `instance_name: service_descriptor`, where a service descriptor is an object:

          {
            name:                Service name (String),
            description:         Description of service in markdown format (String, optional),
            service:             Id of the service module (String),
            admin:               Id of an associated admin module (String, optional),
            provisioning_data:   Provisioning data used upon creation (Object|Function, optional)
          }

      A 'service' consists of a 'service module' and an optional 'admin module' - both are just normal 
      sjs modules (and they can point to the same module).

      The service module is expected to export a `run` function that takes two arguments:
      
      - A 'config' argument that will receive service provisioning data, and a 
      - 'block' argument which is a function bounding the lifetime of the service. `run` 
      is expected to pass the service instance to 'block'.

      The service provisioning data is given by `provisioning_data` - either a plain
      object or a function returning a plain object. If this field is not
      provided, the data will be taken from the service registry's associated `provisioning_store` under the key `'modules/[SERVICE_INSTANCE_NAME]@[SERVICE_NAME]'`.
      
      The (optional) admin module serves the purpose of creating UI for editing the services data in the provisioning store. It is expected to export a `configui` function that needs
      to be executable in an 'xbrowser' environment, and should return a [mho:surface::Element] 
      that defines a [mho:surface/field::] based configuration ui. 
      The [mho:surface::Element] will be instantiated in the context of 
      a [mho:surface/field::FieldMap].

      The provisioning store contains the provisioning data for each of registered service instance for which no `provisioning_data` field is specified. 
      UI for editing the store can be created using [::provisioningUI] which automatically assembles a UI based on the non-provisioned service modules' admin::configui functions.


     Usually an application will only use the well-known global services registry initialized with [::initGlobalRegistry]. To facilitate
     configuration of other registries (with [::provisioningUI]), the `ServicesRegistry` function can also be used to initialize auxilliary registaries.
*/
function ServicesRegistry(service_instances, provisioning_store) {
  return {
    kvstore: provisioning_store,
    instances: service_instances
  };
}
exports.ServicesRegistry = ServicesRegistry;

/**
   @function registerServiceInstances
   @summary Add (additional) service instance to a registry
   @param {optional ::ServicesRegistry} [service_registry] Registry to add service instances to. (Default: global services registry)
   @param {Object} [service_instances] Service instance hash as described at [::ServicesRegistry]
   @desc
      - Throws an error if the registry already contains any service instance with the same name as one of those
        provided in `service_instances`.
*/
function registerServiceInstances(/*registry, service_instances*/) {
  var registry, service_instances;
  if (arguments.length === 1) {
    registry = getGlobalRegistry();
    service_instances = arguments[0];
  }
  else if (arguments.length === 2) {
    registry = arguments[0];
    service_instances = arguments[1];
  }
  else
    throw new Error("registerServiceInstances: unexpected number of parameters");

  service_instances .. @propertyPairs .. @each {
    |[instance_name, descriptor]|
    if (registry.instances[instance_name]) throw new Errror("Registry already has a service instance #{instance_name}");
    registry.instances[instance_name] = descriptor;
  }
}
exports.registerServiceInstances = registerServiceInstances;

//----------------------------------------------------------------------

/**
   @function getGlobalRegistry
   @summary Return the global [::ServicesRegistry]
   
*/
function getGlobalRegistry() {
  if (!gServicesRegistry) throw new Error("Global services registry is not initialized");
  return gServicesRegistry;
};
exports.getGlobalRegistry = getGlobalRegistry;

/**
    @function initGlobalRegistry
    @summary Initialize the global [::ServicesRegistry]
    @param {::ServicesRegistry} [registry] Registry object
    @desc
      This function needs to be called before using the global [::ServicesRegistry] with one of the functions [::withServices],
      [::withService], or [::getGlobalRegistry].

*/
function initGlobalRegistry(registry) {
  if (gServicesRegistry) throw new Error("Global services registry is already initialized");
  gServicesRegistry = registry;
}
exports.initGlobalRegistry = initGlobalRegistry;


var modulesProvisioningDB = registry -> registry.kvstore ? registry.kvstore .. @kv.Subspace('modules');


/**
   @variable builtinServices
   @summary Hash of `name: {description, service, admin}` descriptors of builtin services
*/
exports.builtinServices = {
  'google_api/oauth':
      {
        name:        'google_api/oauth',
        description: 'OAuth-based Google Web API access',
        service:     'mho:services/google_api/oauth/service',
        admin:       'mho:services/google_api/oauth/admin'
      },
  'google_api/service_account':
      {
        name:        'google_api/service_account',
        description: 'Service account-based Google Web API access',
        service:     'mho:services/google_api/service_account/service',
        admin:       'mho:services/google_api/service_account/admin'
      },
  'mandrill':    
      {
        name:        'mandrill',
        description: '[Mandrill](http://mandrill.com) Email Service',
        service:     'mho:services/mandrill/service',
        admin:       'mho:services/mandrill/admin'
      },
  'leveldb':
      {
        name:        'leveldb',
        description: 'Local [LevelDB Instance](http://localhost:6060/doc/#mho:flux/kv::LevelDB)',
        service:     'mho:services/leveldb/service',
        admin:       'mho:services/leveldb/admin'
      },
  'mixpanel':
      {
        name:        'mixpanel',
        description: '[Mixpanel](https://mixpanel.com) Analytics Service',
        service:     'mho:services/mixpanel/service',
        admin:       'mho:services/mixpanel/admin'
      },
  'https':
      {
        name:        'https',
        description: 'HTTPS certificates',
        service:     'mho:services/https/service',
        admin:       'mho:services/https/admin'
      },
  'docker':
      {
        name:        'docker',
        description: 'Docker API',
        service:     'mho:services/docker/service'
        // no admin module (yet)
      }
};

/**
   @function withService
   @altsyntax withService(instance_name) { |instance| ... }
   @param {String} [instance_name]
   @param {Function} [block]
   @summary A shorthand for `withServices({required: [instance_name]}, instances -> block(instances[instance_name]))`
*/
function withService(instance_name, block) {
  withServices([instance_name]) { 
    |instances|
    block(instances[instance_name]);
  }
}
exports.withService = withService;

/**
   @function withServices
   @altsyntax withServices(required) { |{instance1, instance2, ...}| ... }
   @summary Execute `block` with the given running service instances
   @param {Object} [settings]
   @param {Function} [block] Function that will be called with a hash of `instance_name: instance`.
   @setting {Array} [required] Array of instance names of required services
   @setting {Array} [optional] Array of instance names of optional services
   @desc
     `withServices` runs service instance in the registry by calling each
     service's exported `run` function (see description for [::ServicesRegistry]).

     `block` will be passed a 'services' object containing the created service instances:

         {
           instance_name : service_instance,
           ...
         }

    If a particular **optional** requested service instance is set as disabled in the provisioning store, a warning will be written to the console and the corresponding `instance_name` in the services
    object will be set to `null`.


    An error will be thrown if a `required` service is disabled or not registered; a warning will be emitted if an `optional` service is disabled or not registered.
   
    The execution of service instances is reference-counted: `withServices` will start a service if it is not running yet, and a
    service will be terminated when all `withServices` calls that have requested it have terminated.
 */
function withServices(settings, block) {
  if (Array.isArray(settings))
    settings = { required: settings, optional: [] };
  else
    settings = { required: [], optional: [] } .. @override(settings);

  var instances = {};

  var ServiceThrewCondition = @Condition();

  try {
    @concat(settings.required .. @transform(name -> [name, true]),
            settings.optional .. @transform(name -> [name, false])) ..
      @each.par {
        |[instance_name, required]| 
        var run_info = gRunningInstances[instance_name];
        
        if (!run_info) {
          var instance_info = getGlobalRegistry().instances[instance_name];
          if (!instance_info) {
            if (required) 
              throw new Error("Required service instance #{instance_name} not registered.");
            else {
              console.log("Optional service instance #{instance_name} not registered. Ignoring.");
              instances[instance_name] = null;
              continue;
            }
          }
          
          gRunningInstances[instance_name] = run_info = { 
            ref_count: 0,
            api: @Condition(),
            stratum: spawn (function() { 
              try { 
                hold(0); 

                var service_provisioning;
                if (instance_info.provisioning_data !== undefined) {
                  // provisioning is provided statically
                  service_provisioning = instance_info.provisioning_data;
                  if (typeof service_provisioning === 'function')
                    service_provisioning = service_provisioning();
                }
                else {
                  // take provisioning data from registry
                  var provisioning_db = getGlobalRegistry() .. modulesProvisioningDB;
                  if (provisioning_db)
                    service_provisioning =  provisioning_db .. @kv.get("#{instance_name}@#{instance_info.service}", undefined);
                  if (!service_provisioning || !service_provisioning.enabled) {
                    if (required)
                      throw new Error("Required service instance #{instance_name}@#{instance_info.service} not configured or enabled");
                    else {
                      console.log("Optional service instance #{instance_name}@#{instance_info.service} not configured or enabled. Ignoring.");
                      run_info.api.set(null); return;
                    }
                  }
                  service_provisioning = service_provisioning.config;
                }

                require(instance_info.service).run(service_provisioning) { 
                  |api| 
//                  console.log("Started service instance #{instance_name}@#{instance_info.service}"); 
                  run_info.api.set(api); 
                  hold(); 
                }; 
              } 
              catch(e) { 
                run_info.api.set(new Error(e));
                ServiceThrewCondition.set(e);
              } 
            })()
          };
        }
        // so far the block has been synchronous. we have a hold(0) in the stratum above, so that reentrant calls to withServices from 
        // within the run() call see the run_info we've created (very unlikely case, and probably dead-locking case - with a service requesting itself -  but hey)
        ++run_info.ref_count;
        var api = run_info.api.wait();
        if (api instanceof Error) throw api;
        instances[instance_name] = api;
      }
    
    // now run our caller's block:
    waitfor {
      var except = ServiceThrewCondition.wait();
      throw(except);
    }
    or {
      block(instances);
    }
  }
  finally {
    // de-ref & potentially stop services
    instances .. @ownPropertyPairs .. @each {
      |[instance_name, val]|
      if (val === null) continue;
      if (--gRunningInstances[instance_name].ref_count <= 0) {
        //console.log("Terminating service instance #{instance_name}");
        gRunningInstances[instance_name].stratum.abort();
        delete gRunningInstances[instance_name];
      }
    }
  }
}
exports.withServices = withServices;

//----------------------------------------------------------------------
// Provisioning UI (client-side only)

/**
   @function provisioningUI
   @param {::ServicesRegistry} [registry]
   @param {optional mho:surface::HtmlFragment} [title]
   @hostenv xbrowser
   @summary Generate html for configuring provisioning data for the services registered in `registry` that don't have static provisioning data
   @return {mho:surface::Element} Provisioning configuration HTML
*/
exports.provisioningUI = function(registry, title) {

  var CommittedConfig = @ObservableVar(registry .. modulesProvisioningDB .. 
                                       @kv.query(@kv.RANGE_ALL) ..
                                       @filter(function([[key]]) {
                                         var [name, service] = key.split('@');
                                         return registry.instances[name] && registry.instances[name].service === service;
                                       }) ..
                                       @pairsToObject);

  var Config = @ObservableVar(CommittedConfig .. @current);

  var havePendingChanges = @observe(Config, CommittedConfig, 
                                    (config, committed) ->
                                    !@equals(config, committed)
                                   );
  var ChangesCommitted = @ObservableVar(false);

  function applyChanges() {
    CommittedConfig.set(Config .. @current); 
    // save each service's config under a separate key:

    // XXX we only really need to write *changed* services here
    Config .. @current .. @ownPropertyPairs .. @each.par {
      |[name,val]|
      registry .. modulesProvisioningDB .. @kv.set(name, val);
    }
    ChangesCommitted.set(true);
  }

  //----------------------------------------------------------------------
  // helper to make a config panel for one service: 
  var makeConfigPanel = [instance_name, descriptor] ->
    @field.Field("#{instance_name}@#{descriptor.service}") ::
      @field.FieldMap ::
        @Div('mho-services-ui__instance') :: 
          [
            @Hr,
            @Div('mho-services-ui__instance-heading') ::
              [
                @H4('mho-services-ui__instance-name') :: [instance_name, ': ', descriptor.name],
                @field.Field('enabled') :: 
                  @Label('mho-services-ui__enable-checkbox') ::
                    [
                      @Checkbox(), 
                      ' Enabled'
                    ],
              ],
            @P('mho-services-ui__instance-desc') :: @RawHTML :: (descriptor.description||'') .. @marked.convert,

            @field.Field('config') ::
              @field.FieldMap ::
                @Div('mho-services-ui__instance-body') ::
                  require(descriptor.admin).configui()
          ];
        

  //----------------------------------------------------------------------

  var ui = @field.Field({Value: Config}) :: 
             @field.FieldMap :: 
               @Div('mho-services-ui') .. ProvisioningUICSS ::
                 [
                   @Div('mho-services-ui__heading') :: [
                     title || @H3 :: "Services Provisioning",
                     @Btn('raised accent') .. 
                       @OnClick(applyChanges) ..
                       @Enabled(havePendingChanges) :: "Apply Changes"
                   ],
                   ChangesCommitted .. 
                     @project(committed ->
                              committed ? 
                              @P('mho-services-ui__alert') :: 'Committed Changes will become effective when server is restarted!'
                             ),
                   registry.instances .. @ownPropertyPairs .. 
                     @filter([k,v] -> v.provisioning_data === undefined && v.admin) .. 
                     @map.par(makeConfigPanel)
                   /*,@ContentGenerator((append) ->
                                     append(@Div(Config .. @project(@inspect)))) */
                 ];


  return ui;
};


var ProvisioningUICSS = @CSS(
  `
  .mho-services-ui__heading { 
    display:flex; 
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 16px;
    & > * {
      margin-top: 16px;
      margin-bottom: 0px;
    }
  }

  .mho-services-ui__instance-heading {
    display:flex; 
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 16px;
    & > * {
      margin-top: 16px;
      margin-bottom: 0px;
    }
  }

  `);
