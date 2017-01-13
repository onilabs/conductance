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

@ = require(['mho:std', 
             {id:'mho:services', name:'services'},
             {id:'mho:flux/kv', name:'kv'}
            ]);

var SERVICE_INSTANCES = {
  mail:             @services.builtinServices['mandrill'],
  google_api_oauth: @services.builtinServices['google_api/oauth'],
  db:               @services.builtinServices['leveldb'],
  https:            @services.builtinServices['https']
};


//----------------------------------------------------------------------
// helpers

// create an encrypted localdb for storing config data
function ConfigDB(file, pw, block) {
  @kv.LocalDB({file:file}) {
    |db|
    db .. @kv.Encrypted({password:pw}) {
      |encrypted|
      block(encrypted);
    }
  }
}


//----------------------------------------------------------------------
// Services


exports.run = function(block) {

  //----------------------------------------------------------------------
  // retrieve key for config.db either from config.key file, or by
  // prompting user

  var config_key = '';

  var config_key_file = require.url('../../config.key') .. @url.toPath;
  if (@fs.isFile(config_key_file)) {
    config_key = @fs.readFile(config_key_file, 'utf8');
  }
  else {
    @terminal = require('sjs:nodejs/terminal');
    @terminal.color({foreground:'black', background:'green'}).write(
      "No 'config.key' file found. Please enter key for config.db: ").reset();
    try {
      @terminal.color({foreground:'green', background:'green', attribute:'hidden'});
      config_key = (process.stdin .. @stream.lines .. @first).toString();
    }
    finally {
      @terminal.reset();
    }
  }

  // strip trailing CR-LF
  config_key = config_key.replace(/([\r\n]+)$/, '');


  //----------------------------------------------------------------------


  ConfigDB(require.url('../../config.db') .. @url.toPath, config_key) {
    |configDB|
  
    // Application Services
    var registry = @services.ServicesRegistry(configDB .. @kv.Subspace('services'),
                                              SERVICE_INSTANCES);

    @services.initGlobalRegistry(registry);

    @services.withServices({optional: SERVICE_INSTANCES .. @ownKeys .. @toArray}) {
      |services|
      block(services);
    }
  }
};
