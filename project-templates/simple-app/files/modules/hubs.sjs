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

@ = require('mho:std');

require.hubs.push(['lib:', require.url('./lib/')]);
require.hubs.push(['backend:', require.url('./backend/')]);

if (@sys.hostenv === 'nodejs') {
  // XXX this is needed for tools that make use of our services (leveldb
  // in particular), and are not invoked via config.mho.
  // leveldb should really work on an 'application-root' key instead of 'configRoot'.
  if (@env.configPath() === undefined) {
    @env.set('config', {path: require.url('../config.mho') .. @url.toPath});
  }
}
