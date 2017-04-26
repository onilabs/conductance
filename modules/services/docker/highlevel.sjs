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
  @summary High-level Docker Engine API
*/

@ = require([
  'mho:std',
  {id:'./REST/v1-25', name: 'REST'}
]);

/**
   @function parseMultiplexedStdOutErr
   @summary Parse a muliplexed stdout/stderr response stream as e.g. returned by [./REST/v1-25::containerAttach]
   @param {nodejs stream} [incoming] Stream to parse (usually the IncomingMessage of the underlying docker request)
   @param {optional Object} [settings]
   @setting {String} [encoding='utf8'] 
   @return {sjs:sequence::Stream} [encoding='utf8'] Encoding of returned content; if 'null' is specified, raw buffers will be returned 
   @desc
     The returned stream consists of items:

         {
           stream_type: Integer, // 0: stdin, 1: stdout, 2: stderr
           content: String|Buffer
         }
*/
function parseMultiplexedStdOutErr(incoming, settings) {
  
  settings = {
    encoding: 'utf8'
  } .. @override(settings);

  var eos = {};
  return incoming .. @stream.contents() ..
    @parseBytes(eos, function(api) {
      while (1) {
        var stream_type = api.readUint8();
        if (stream_type === eos) break;
        api.readUint8Array(3); // discard
        var payload_length = api.readUint32();
        var payload = api.readUint8Array(payload_length);
        var content = @toBuffer(payload);
        if (settings.encoding)
          content = content.toString(settings.encoding);
        api.emit(
          {
            stream_type: stream_type,
            content: content
          }
        );
      }
    });
}
exports.parseMultiplexedStdOutErr = parseMultiplexedStdOutErr;
