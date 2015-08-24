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
  @summary Configuration helpers for service account-based Google Web API access
  @hostenv xbrowser
  @nodoc
*/

// TODO: document

@ = require(['mho:std', 'mho:app']);

exports.configui = function() {
  return   [
             @P ::
               `Create a new Service Account with a JSON key using the 'APIs & auth' settings for your
                project under the 
                ${@A("Google Developers Console", {href:'https://console.developers.google.com'})
                and copy the full contents of the JSON key file here.
               `,

             @field.Field('json_key_file') ::
               @FormGroup ::
                 [
                   @ControlLabel('JSON Key File'),
                   @TextArea()
                 ],
            
             @field.Field('scopes') ::
               @FormGroup ::
                 [
                   @ControlLabel('Authorization Scopes (comma-separated)'),
                   @Input()
                 ]
           ]
};
