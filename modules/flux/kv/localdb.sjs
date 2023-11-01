/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance.
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @nodoc
 */
@ = require(['sjs:std',
             { id: 'sjs:tuple-key-encoding', name: 'encoding' },
             { id: './wrap', name: 'wrap' }]);


var cache_localStorage = {};
var cache_sessionStorage = {};
var cache_file = {};

function get_cache(o, s, f) {
  if (o[s] == null) {
    o[s] = f();
  }
  return o[s];
}

__js function serialize(dict) {
  var s = dict.elements .. @map([k,v] -> "  [#{JSON.stringify(@encoding.decodeKey(k))}, #{JSON.stringify(v)}]");
  return "[\n#{s.join(',\n')}\n]";
}

function save_db(dict, options) {

  if (options.localStorage != null) {
    localStorage[options.localStorage] = dict..serialize();

  } 
  else if (options.sessionStorage != null) {
    sessionStorage[options.sessionStorage] = dict..serialize();
  }
  else if (options.file != null) {
    @fs.writeFile(options.file, dict..serialize(), 'utf8');
  }
  else if (options.string != null) {
    options.string.set(dict..serialize());
  }
}

function wrap_dict(dict, options) {
  /*
    MutationDispatcher receives all mutations in the form
    [{type:'put'|'del', key:encoded_key, value:encoded_value}, ...]
   */
  var MutationDispatcher = @Dispatcher();

  return {
    changes: @events(MutationDispatcher),

    get: function (key) {
      // XXX -> this is the syntax we want:      return dict.get(key, undefined);
      return dict.get(key);
    },

    // wrap.sjs guarantees that batch will only ever be accessed sequentially, so no need to
    // use @fn.sequential here
    batch: function (ops) {
      if (options.readonly) throw new Error("Attempted mutation on readonly database");

      ops ..@each(function (op) {
        var type  = op.type;
        var key   = op.key;
        var value = op.value;

        if (key == null) {
          throw new Error("Key cannot be null: " + key);
        }

        if (type === 'put') {
          dict.set(key, value);

        } else if (type === 'del') {
          dict.delete(key);

        } else {
          throw new Error("Unknown type: " + type);
        }
      });

      save_db(dict, options);

      MutationDispatcher.dispatch(ops);
    },

    query: function(info) {
      var stream = dict.range(info.gte, info.lt);
      if (info.reverse)
        stream = stream .. @reverse;
      if (info.limit !== -1)
        stream = stream .. @take(info.limit);
      return stream;
    }
  };
}

function load_db1(dict, input) {
  JSON.parse(input) .. @each {
    |[k,v]|
    dict.set(@encoding.encodeKey(k), v);
  };
}

function load_db(options) {
  if (options.localStorage != null) {
    return get_cache(cache_localStorage, options.localStorage, function () {
      var dict = @SortedMap({comparator:'encodedTuples'});

      var db = localStorage[options.localStorage];
      if (db) {
        load_db1(dict, db);
      }

      return @wrap.wrapDB(wrap_dict(dict, options));
    });
  } 
  else if (options.sessionStorage != null) {
    return get_cache(cache_sessionStorage, options.sessionStorage, function() {
      var dict = @SortedMap({comparator:'encodedTuples'});
      var db = sessionStorage[options.sessionStorage];
      if (db) {
        load_db1(dict, db);
      }
      return @wrap.wrapDB(wrap_dict(dict, options));
    });
  }
  else if (options.file != null) {
    return get_cache(cache_file, options.file, function () {
      var dict = @SortedMap({comparator:'encodedTuples'});

      // TODO is there a better way of dealing with the file not existing ?
      try {
        load_db1(dict, @fs.readFile(options.file, 'utf8'));
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }

      return @wrap.wrapDB(wrap_dict(dict, options));
    });

  } 
  else if (options.string != null) {
    var dict = @SortedMap({comparator:'encodedTuples'});
    var value = options.string .. @current;
    if (value)
      load_db1(dict, value);
    return @wrap.wrapDB(wrap_dict(dict, options));
  }
  else {
    return @wrap.wrapDB(wrap_dict(@SortedMap({comparator:'encodedTuples'}), options));
  }
}

function LocalDB(options) {
  var backends = 0;
  if (options.localStorage != null) ++backends;
  if (options.sessionStorage != null) ++backends;
  if (options.file != null) ++backends;
  if (options.string != null) ++backends;
  if (backends > 1) {
    throw new Error("Cannot specify more than one storage backend at the same time");
  }

  if (options.file != null) {
    // TODO is path.resolve correct ?
    options.file = @path.resolve(options.file);
  }

  return load_db(options);
}
exports.LocalDB = LocalDB;
