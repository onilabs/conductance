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
  @summary Services Management
  @desc
    A central point for configuring, starting and stopping application services
*/

var modules = ['mho:std',
               {id:'mho:flux/kv', name:'kv'}
              ];

if (require('sjs:sys').hostenv === 'xbrowser') {
  modules = modules.concat('mho:app', {id:'sjs:marked', name:'marked'});
}

@ = require(modules);

/**
   @class ServicesRegistry
   @summary Object keeping track of services configuration data
   @function ServicesRegistry
   @param {./flux/kv::KVStore} [kvstore] Key-Value store for holding configuration data (e.g. typically a [./flux/kv::Subspace] of an [./flux/kv::Encrypted] persistent [./flux/kv::LocalDB])
*/
exports.ServicesRegistry = function(kvstore) {
  return {
    kvstore:  kvstore,
    instances: {}
  };
};

var modulesConfigDB = registry -> registry.kvstore .. @kv.Subspace('modules');

/**
   @function register
   @summary Register services for management by a ServicesRegistry instance
   @param {::ServicesRegistry} [registry] 
   @param {Object} [service_instances] Hash of `instance_name: service descriptors`
   @desc
      A service descriptor is an object:

          {
            name:          Service name (String),
            description:   Description of service in markdown format (String, optional),
            service:       Id of the service module (String),
            admin:         Id of an associated admin module (String, optional)
          }

      Registered services instances get an entry in the registry's associated key-value store, where they
      can be configured and enabled/disabled using e.g. [::configUI].

      A 'service' consists of a 'service module' and an 'admin module' - both are just normal 
      sjs modules (and they can point to the same module).

      The service module is expected to export a `run` function that takes two arguments:
      a 'config' argument that will receive the current service configuration and a 
      'block' argument which is a function bounding the lifetime of the service. `run` 
      is expected to pass the service instance to 'block'.

      The (optional) admin module is expected to export a `configui` function that needs
      to be executable in an 'xbrowser' environment, and should return a [mho:surface::Element] 
      that defines a [mho:surface/field::] based configuration ui. 
      The [mho:surface::Element] will be instantiated in the context of 
      a [mho:surface/field::FieldMap].
      

*/
exports.register = function(registry, service_instances) {
  service_instances .. @ownPropertyPairs .. @each {
    |[instance,descriptor]|
    if (registry.instances[instance]) 
      throw new Error("Service Instance #{instance} already registered");
    registry.instances[instance] = descriptor;
  }
};

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
      }
};


/**
   @function run
   @summary Run all enabled registered services
   @param {::ServicesRegistry} [registry]
   @param {Function} [block] Block bounding services lifetime
   @desc 
     `run` creates service instances for each enabled service in the registry by calling each
     service's exported `run` function (see description for [::register]).

     `block` will be passed a 'services' object containing the created service instances:

         {
           instance_name : service_instance,
           ...
         }

    If a particular requested service is disabled, a warning will be
    written to the console and the corresponding `instance_name` in the services
    object will be set to `null`.

    If a service is requested that hasn't been [::register]ed an exception will be thrown.
*/
exports.run = function(registry, block) {
  
  try {
    var service_ctxs = [];
    var services = {};
    registry.instances .. @ownPropertyPairs .. @each.par {
      |[instance_name, descriptor]|
      var config = registry .. modulesConfigDB .. @kv.get("#{instance_name}@#{descriptor.service}", undefined);
      if (!config || !config.enabled) {
        console.log("WARNING: Service '#{instance_name}' is not enabled");
        continue;
      }
      var ctx = @breaking {|brk| 
        require(descriptor.service).run(config.config, brk);
      };  
      service_ctxs.push(ctx);
      services[instance_name] = ctx.value;
    }

    block(services);
  }
  finally {
    // clean up after services
    service_ctxs .. @each.par { |ctx| ctx.resume(); }
  }
};

/**
   @function configUI
   @param {::ServicesRegistry} [registry]
   @hostenv xbrowser
   @summary Generate html for configuring the services registered in `registry`
   @return {mho:surface::Element} Configuration HTML
*/
exports.configUI = function(registry) {

  var CommittedConfig = @ObservableVar(registry .. modulesConfigDB .. 
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
      registry .. modulesConfigDB .. @kv.set(name, val);
    }
    ChangesCommitted.set(true);
  }

  //----------------------------------------------------------------------
  // helper to make a config panel for one service: 
  var makeConfigPanel = [instance_name, descriptor] ->
    @field.Field("#{instance_name}@#{descriptor.service}") ::
      @field.FieldMap ::
        @Panel :: 
          [
            @PanelHeading ::
              [
                @field.Field('enabled') :: 
                  @Label .. @Class('pull-right') :: 
                    [
                      @Checkbox(), 
                      ' Enabled'
                    ],
                @H4 :: [instance_name, ': ', descriptor.name],
                @RawHTML :: descriptor.description .. @marked.convert
              ],

            @field.Field('config') ::
              @field.FieldMap ::
                @PanelBody ::
                  require(descriptor.admin).configui()
          ];
        

  //----------------------------------------------------------------------

  var ui = @field.Field({Value: Config}) :: 
             @field.FieldMap :: 
               @Div ::
                 [
                   ChangesCommitted .. 
                     @project(committed ->
                              committed ? 
                              @Div('Committed Changes will become effective when server is restarted!') ..
                                @Class("alert alert-info")
                             ),
                   @Btn('primary', 'Apply Changes') .. 
                     @OnClick(applyChanges) ..
                     @Enabled(havePendingChanges) ..
                     @Class('pull-right'),
                   @H1('Services'),
                   registry.instances .. @ownPropertyPairs .. @map.par(makeConfigPanel),
                   @ContentGenerator((append) ->
                                     append(@Div(Config .. @project(@inspect))))
                 ];


  return ui;
};
