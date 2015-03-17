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
    descriptors: {}
  };
};

var modulesConfigDB = registry -> registry.kvstore .. @kv.Subspace('modules');

/**
   @function register
   @summary Register services for management by a ServicesRegistry instance
   @param {::ServicesRegistry} [registry] 
   @param {Array} [descriptors] Array of service descriptors 
   @desc
      A service descriptor is an object:

          {
            name:          Service name (String),
            description:   Description of service in markdown format (String, optional),
            service:       Id of the service module (String),
            admin:         Id of an associated admin module (String, optional)
          }

      Registered services get an entry in the registry's associated key-value store, where they
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
exports.register = function(registry, descriptors) {
  descriptors .. @each {
    |descriptor|
    if (registry.descriptors[descriptor.name]) 
      throw new Error("Service #{descriptor.name} already registered");
    registry.descriptors[descriptor.name] = descriptor;
  }
};


/**
   @function run
   @summary Run all enabled registered services
   @param {::ServicesRegistry} [registry]
   @param {Object} [configuration] `{ instance_name: service_name, ... }` object
   @param {Function} [block] Block bounding services lifetime
   @desc 
     `run` creates service instances each property pair in `configuration` by calling each
     service's exported `run` function (see description for [::register]).

     `block` will be passed a 'services' object containing the created service instances:

         {
           instance_name : service_instance,
           ...
         }

    If a particular requested service is disabled, a warning will be
    written to the console and the corresponding `instance_name` in the services
    object will be set to `null`.

    If a service is requested that hasn't been [::register]ed, and exception will be thrown.
*/
exports.run = function(registry, configuration, block) {
  
  try {
    var service_ctxs = [];
    var services = {};
    configuration .. @propertyPairs .. @each.par {
      |[name, service_id]|
      var descriptor = registry.descriptors[service_id];
      if (!descriptor) {
        throw new Error("Unknown service '#{service_id}'");
      }
      var config = registry .. modulesConfigDB .. @kv.get("#{service_id}@#{descriptor.service}", undefined);
      if (!config || !config.enabled) {
        console.log("WARNING: Service '#{service_id}' is not enabled");
        continue;
      }
      var ctx = @breaking {|brk| 
        require(descriptor.service).run(config.config, brk);
      };  
      service_ctxs.push(ctx);
      services[name] = ctx.value;
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
                                         return registry.descriptors[name] && registry.descriptors[name].service === service;
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
    Config .. @current .. @propertyPairs .. @each.par {
      |[name,val]|
      registry .. modulesConfigDB .. @kv.set(name, val);
    }
    ChangesCommitted.set(true);
  }

  //----------------------------------------------------------------------
  // helper to make a config panel for one service: 
  var makeConfigPanel = descriptor ->
    @field.Field("#{descriptor.name}@#{descriptor.service}") ::
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
                @H4 :: descriptor.name,
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
                   registry.descriptors .. @values .. @map.par(makeConfigPanel),
                   @ContentGenerator((append) ->
                                     append(@Div(Config .. @project(@inspect))))
                 ];


  return ui;
};
