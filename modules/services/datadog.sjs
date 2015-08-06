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

/** @nodoc */

@ = require('sjs:std');

var RequestFailed = function(status, result) {
  var rv = new Error("Request failed [HTTP #{status}]. Response: " + JSON.stringify(result));
  rv.result = result;
  return rv;
}

var handleResponse = function(rv) {
  var content = rv.content;
  if (rv.getHeader && rv.getHeader('content-type').toLowerCase() .. @contains('json')) {
    content = JSON.parse(content);
  }
  if (rv.status >= 200 && rv.status < 300) {
    // ok
    return content;
  }
  throw RequestFailed(rv.status, content);
};

exports.Datadog = function(opts) {
  opts = opts ? opts .. @clone() : {};
  var host = opts.host = opts.host || require('nodejs:os').hostname();
  @assert.string(host, 'datadog host');
  opts.root = opts.root || 'https://app.datadoghq.com/api/v1/';

  var withDefaultTags = function(tags) {
    tags = tags || [];
    if(opts.defaultTags) {
      tags = tags.concat(opts.defaultTags);
    }
    return tags;
  };

  var rv = {};

  rv.setBackend = function(backend) {
    if(@isString(backend)) backend = exports.backends .. @get(backend);
    backend = backend(opts);
    if(!backend.makeCall) throw new Error("Invalid backend");
    rv.backend = backend;
  };
  rv.setBackend(opts.backend || exports.backends.real);

  rv.event = function(opts) {
    var data = {};
    @assert.string(opts.title);
    data.title = opts.title;

    @assert.optionalString(opts.text);
    data.text = opts.text;

    @assert.optionalNumber(opts.dateHappened);
    if (opts.dateHappened) data.date_happened = opts.dateHappened;

    @assert.optionalString(opts.priority);
    if (opts.priority) data.priority = opts.priority;

    @assert.optionalArrayOfString(opts.tags);
    data.tags = opts.tags .. withDefaultTags;

    @assert.optionalString(opts.alertType);
    if (opts.alertType) {
      ['error', 'warning', 'info', 'success'] .. @assert.contains(opts.alertType);
      data.alert_type = opts.alertType;
    }

    @assert.optionalString(opts.aggregationKey);
    if (opts.aggregationKey) data.aggregation_key = opts.aggregationKey;

    @assert.optionalString(opts.sourceTypeName);
    if (opts.sourceTypeName) data.source_type_name = opts.sourceTypeName;

    return rv.backend.makeCall('events', data);
  };

  rv.metrics = function(metrics, opts) {
    if(!opts) opts = {};
    var series = metrics .. @ownPropertyPairs .. @map(function([name,points]) {
      var data = {};
      data.metric = name;

      data.host = host;

      data.points = points .. @map(function(v) {
        if (Array.isArray(v)) {
          @assert.number(v[0]);
          @assert.number(v[1]);
          return v;
        }
        @assert.number(v);
        return [Math.floor(Date.now() / 1000), v];
      });

      @assert.optionalArrayOfString(opts.tags);
      data.tags = opts.tags .. withDefaultTags;

      @assert.optionalString(opts.type);
      if (opts.type) {
        ['gauge', 'counter'] .. @assert.contains(opts.type);
        data.type = opts.type;
      }
      return data;
    });

    return rv.backend.makeCall('series', {series: series});
  };

  rv.metric = function(name, opts, points) {
    if (arguments.length == 2) {
      points = opts;
      opts = {};
    }

    var m = {};
    @assert.string(name);
    m[name] = points;
    return rv.metrics(m);
  };

  var loggingTailBuffer = function(seq, count, options) {
    options = options || {};
    var drop = options.drop .. @assert.ok();

    return @Stream(function(r) {
      var Q = @Queue(count, true), eos = {};

      waitfor {
        while (1) {
          var x = Q.get();
          if (x === eos) return;
          r(x);
        }
      }
      and {
        seq .. @each {
          |x|
          if (Q.isFull()) {
            // drop the oldest value to make room for the put():
            options.drop(Q.get());
          }
          Q.put(x);
        }
        Q.put(eos);
      }
    });
  }

  rv.nonblocking = function(opts) {
    // make a copy of functions in `rv`, but which:
    // - queue all events and return _immediately_
    // - never throw (all errors are logged)
    // - logs dropped event types past `capacity`
    var events = @Emitter();
    var blocking = this;
    var eventStream = events .. loggingTailBuffer(opts.capacity, {
      drop: ([type,]) -> @logging.warn("Dropping queued datadog #{type}"),
    });
    //var STOP = {};
    var thread = spawn(function() {
      eventStream .. @each {|item|
        //if(item === STOP) break;
        var [fn, args] = item;
        try {
          blocking[fn].apply(null, args);
        } catch(e) {
          @logging.error("Failed to send datadog #{fn}:\n#{e}");
          @logging.info("Args:", JSON.stringify(args));
        }
      }
    }());

    var rv = [ 'event', 'metric', 'metrics' ]
      .. @map(key -> [key, function() { events.emit([key, arguments]) }])
      .. @pairsToObject();
    return rv;
  };

  return rv;
};

var retryStatuses = [ 0 ];
var maxRetries = 5;
var retryDelay = 5000; // 5s

exports.backends = {
  log: function(opts) {
    var level = opts.logLevel || @logging.INFO;
    return {
      makeCall: function(path, data) {
        @logging.log(level, [" - generated datadog call: #{JSON.stringify(data)}"]);
      },
    };
  },
  real: function(opts) {
    @assert.string(opts.apikey, 'datadog API key');
    return {
      makeCall: function(path, data) {
        @debug("sending datadog event: #{JSON.stringify(data, null, '  ')}");
        for(var remainingTries = maxRetries; remainingTries>0; remainingTries--) {
          var rv = @http.request(
            [opts.root, path, {api_key:opts.apikey}],
            {
              method: 'POST',
              body: JSON.stringify(data),
              headers: {
                'Content-type':'application/json',
              },
              throwing: false,
              response: 'full',
            });

          if (retryStatuses .. @hasElem(rv.status)) {
            hold(retryDelay);
            @warn("HTTP #{rv.status} - retrying ... (#{remainingTries} attempts remaining)");
            continue;
          }

          return handleResponse(rv);
        }
      },
    };
  },
};

