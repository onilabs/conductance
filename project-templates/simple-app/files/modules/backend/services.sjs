/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
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

// create an encrypted localdb for storing provisioning data
function ProvisioningDB(file, pw, block) {
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
  // retrieve key for provisioning.db either from provisioning.key file, or by
  // prompting user

  var provisioning_key = '';

  var provisioning_key_file = require.url('../../provisioning.key') .. @url.toPath;
  if (@fs.isFile(provisioning_key_file)) {
    provisioning_key = @fs.readFile(provisioning_key_file, 'utf8');
  }
  else {
    @terminal = require('sjs:nodejs/terminal');
    @terminal.color({foreground:'black', background:'green'}).write(
      "No 'provisioning.key' file found. Please enter key for provisioning.db: ").reset();
    try {
      @terminal.color({foreground:'green', background:'green', attribute:'hidden'});
      provisioning_key = (process.stdin .. @stream.lines .. @first).toString();
    }
    finally {
      @terminal.reset();
    }
  }

  // strip trailing CR-LF
  provisioning_key = provisioning_key.replace(/([\r\n]+)$/, '');


  //----------------------------------------------------------------------


  ProvisioningDB(require.url('../../provisioning.db') .. @url.toPath, provisioning_key) {
    |provisioningDB|
  
    // Application Services
    var registry = @services.ServicesRegistry(SERVICE_INSTANCES,
                                              provisioningDB .. @kv.Subspace('services')
                                             );

    @services.initGlobalRegistry(registry);

    @services.withServices({optional: SERVICE_INSTANCES .. @ownKeys .. @toArray}) {
      |services|
      block(services);
    }
  }
};
