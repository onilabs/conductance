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

@ = require([
  'mho:std'
]);

/**
   @function listAlbums
   @summary Return a list of albums
   @desc
     #### Scopes
     This API call requires authorization with (at least one of) the following scope(s):
       
     * https://picasaweb.google.com/data/

*/

function listAlbums(client, params) {
  return client.performRequest({
    url:'https://picasaweb.google.com/data/feed/api/user/default',
    params: params .. @merge({v:2, alt:'json'}),
    requiredParams: [],
    pathParams: []
  });
}
exports.listAlbums = listAlbums;

/**
   @function recentPhotos
   @summary Return a [sjs:sequence::Stream] of recent photos
   @desc
     See https://developers.google.com/gdata/docs/2.0/reference for valid parameters

     #### Scopes
     This API call requires authorization with (at least one of) the following scope(s):
       
     * https://picasaweb.google.com/data/
*/

function recentPhotos(client, params) {
  return @Stream(function(receiver) {

//    var index = 1;

    try {
//      while (1) {
        // XXX we're using a very large max-results here, because the paging mechanism in the API is broken; see http://stackoverflow.com/questions/25263934/picasa-web-albums-api-no-effect-of-start-index-in-photos-feed
        var res = client.performRequest({
          url:'https://picasaweb.google.com/data/feed/api/user/default',
          params: {v:2, alt:'json', kind:'photo', 'max-results':10000 /*, 'start-index':index*/} .. @merge(params),
          requiredParams: [],
          pathParams: []    
        });
        res.feed.entry .. @each {
          |entry|
//          ++index;
          receiver(entry);
        }
//      }
    }
    catch (e) {
      console.log(String(e)); 
    }
  });
}
exports.recentPhotos = recentPhotos;
