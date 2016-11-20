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
   @summary Application naming and versioning
*/

/**
   @variable version
   @summary Application version
   @desc
     This number needs to be incremented whenever the application is updated, 
     so that we can detect version mismatches between running clients that 
     reconnect to an restarted server that exposes a different api version.
*/
exports.version = 1;

/**
   @variable name
   @summary Application name
   @desc 
     Used in various places of the initial project files
*/
exports.name = "simple-app";
