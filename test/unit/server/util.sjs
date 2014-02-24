@ = require('sjs:object');
@stream = require('sjs:nodejs/stream');
@url = require('sjs:url');

exports.mockRequest = function(settings) {
  settings = settings || {};
  var url = settings.url || 'http://example.com/';
  var method = settings.method || 'GET';
  return {
    url: @url.parse(url),
    request: {
      method: method,
    },
    response: (new @stream.WritableStringStream()) .. @extend({
      writeHead: (h) -> this.head = h,
    }),

    result: -> {
      head: this.response.head,
      body: this.response.data,
    }
  }
};
