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
   @nodoc
 */
@ = require(['sjs:std',
             { id: './encoding', name: 'encoding' },
             { id: './util', name: 'util' }]);

var SortedDict = (function () {
  __js {
    // http://arclanguage.org/item?id=14181
    // http://arclanguage.org/item?id=18936
    var nil   = {};
    nil.depth = 0;
    nil.size  = 0;

    function balanced_node(node, left, right) {
      var l_depth = left.depth;
      var r_depth = right.depth;

      // Left side is deeper
      if (l_depth > r_depth + 1) {
        var lleft  = left.left;
        var lright = left.right;

        // Right side is deeper
        if (lright.depth > lleft.depth) {
          // Left rotate -> Right rotate
          return lright.children(left.children(lleft, lright.left),
                                 node.children(lright.right, right));

        // Left side is deeper
        } else {
          // Right rotate
          return left.children(lleft, node.children(lright, right));
        }

      // Right side is deeper
      } else if (r_depth > l_depth + 1) {
        var rright = right.right;
        var rleft  = right.left;

        // Left side is deeper
        if (rleft.depth > rright.depth) {
          // Right rotate -> Left rotate
          return rleft.children(node.children(left, rleft.left),
                                right.children(rleft.right, rright));

        // Right side is deeper
        } else {
          // Left rotate
          return right.children(node.children(left, rleft), rright);
        }

      // No balancing needed
      } else {
        return node.children(left, right);
      }
    }

    function concat(x, y) {
      if (x === nil) {
        return y;

      } else if (y === nil) {
        return x;

      // TODO what if the depths are the same?
      } else if (x.depth < y.depth) {
        return balanced_node(y, concat(x, y.left), y.right);

      } else {
        return balanced_node(x, x.left, concat(x.right, y));
      }
    }

    /*function sort(x, y) {
      if (x === y) {
        return 0;
      } else if (x < y) {
        return -1;
      } else {
        return 1;
      }
    }*/

    /*
    function sortArray1(x, y, l) {
      for (var i = 0; i < l; ++i) {
        if (x[i] < y[i]) {
          return -1;

        } else if (x[i] > y[i]) {
          return 1;
        }
      }

      return 0;
    }

    function sortArray(x, y) {
      if (x.length === y.length) {
        return sortTypedArray1(x, y, x.length);

      } else if (x.length < y.length) {
        return sortTypedArray1(x, y, x.length) || -1;

      } else {
        return sortTypedArray1(x, y, y.length) || 1;
      }
    }*/


    function KeyNode(left, right, key, value) {
      this.left  = left;
      this.right = right;
      this.key   = key;
      this.value = value;
      this.depth = Math.max(left.depth, right.depth) + 1;
    }

    KeyNode.prototype.children = function (left, right) {
      return new KeyNode(left, right, this.key, this.value);
    };

    KeyNode.prototype.modify = function (key, value) {
      return new KeyNode(this.left, this.right, key, value);
    };


    function key_get(node, sort, key) {
      while (node !== nil) {
        var order = sort(key, node.key);
        if (order === 0) {
          break;

        } else if (order < 0) {
          node = node.left;

        } else {
          node = node.right;
        }
      }

      return node;
    }

    function key_set(node, sort, key, value) {
      if (node === nil) {
        return new KeyNode(nil, nil, key, value);

      } else {
        var left  = node.left;
        var right = node.right;

        var order = sort(key, node.key);
        if (order === 0) {
          return node.modify(key, value);

        } else if (order < 0) {
          return balanced_node(node, key_set(left, sort, key, value), right);

        } else {
          return balanced_node(node, left, key_set(right, sort, key, value));
        }
      }
    }

    function key_remove(node, sort, key) {
      if (node === nil) {
        return node;

      } else {
        var left  = node.left;
        var right = node.right;

        var order = sort(key, node.key);
        if (order === 0) {
          return concat(left, right);

        } else if (order < 0) {
          return balanced_node(node, key_remove(left, sort, key), right);

        } else {
          return balanced_node(node, left, key_remove(right, sort, key));
        }
      }
    }


    function Dict(root, sort) {
      this.root = root;
      this.sort = sort;
    }

    Dict.prototype.has = function (key) {
      return key_get(this.root, this.sort, key) !== nil;
    };

    Dict.prototype.get = function (key, def) {
      var node = key_get(this.root, this.sort, key);
      if (node === nil) {
        if (arguments.length === 2) {
          return def;
        } else {
          throw new Error("Key " + key + " not found");
        }
      } else {
        return node.value;
      }
    };

    Dict.prototype.remove = function (key) {
      return new Dict(key_remove(this.root, this.sort, key), this.sort);
    };

    Dict.prototype.set = function (key, value) {
      return new Dict(key_set(this.root, this.sort, key, value), this.sort);
    };

    function SortedDict() {
      return new Dict(nil, @encoding.encodedKeyCompare);
    }
  }


  function iter_tree(node) {
    return @Stream(function (emit) {
      function loop(node) {
        if (node !== nil) {
          loop(node.left);
          emit([node.key, node.value]);
          loop(node.right);
        }
      }

      loop(node);
    });
  }

  function iter_range(node, info) {
    return @Stream(function (emit) {
      function loop(node) {
        if (node !== nil) {
          var start = info.start(node);
          var end   = info.end(node);

          if (start) {
            loop(node.left);
          }

          if (start && end) {
            emit([node.key, node.value]);
          }

          if (end) {
            loop(node.right);
          }
        }
      }

      loop(node);
    });
  }

  Dict.prototype.serialize = function () {
    var s = iter_tree(this.root) ..@map(function ([key, value]) {
      return "[" + JSON.stringify(key) + "," + JSON.stringify(value) + "]";
    });

    return "[" + s.join(",") + "]";
  };

  Dict.prototype.range = function (info) {
    var sort  = this.sort;
    var start = info.gte;
    var end   = info.lt;
    var range = iter_range(this.root, {
      start: function (x) {
        return sort(x.key, start) >= 0;
      },
      end: function (x) {
        return sort(x.key, end) < 0;
      }
    });

    // TODO faster implementation of this
    if (info.reverse) {
      range = @reverse(range);
    }

    if (info.limit !== -1) {
      range = @take(range, info.limit);
    }

    return range;
  };

  return SortedDict;
})();


var cache_localStorage = {};
var cache_file = {};

function get_cache(o, s, f) {
  if (o[s] == null) {
    o[s] = f();
  }
  return o[s];
}

function save_db(dict, options) {
  if (options.localStorage != null) {
    localStorage[options.localStorage] = dict.serialize();

  } else if (options.file != null) {
    @fs.writeFile(options.file, dict.serialize(), 'utf8');
  }
}

function wrap_dict(dict, options) {
  /*
    MutationEmitter receives all mutations in the form
    [{type:'put'|'del', key:encoded_key, value:encoded_value}, ...]
   */
  var MutationEmitter = @Emitter();

  return {
    changes: MutationEmitter,

    constructor: Array,

    // TODO this is inefficient
    encodeString: function (str) {
      return @stringToUtf8(str) ..@map(x -> x.charCodeAt(0));
    },

    // TODO this is inefficient
    decodeString: function (buf, start, end) {
      if (!(start === 0 && end === buf.length)) {
        buf = buf.slice(start, end);
      }

      buf = buf ..@map(x -> String.fromCharCode(x));
      return @utf8ToString(buf.join(""));
    },

    encodeValue: function (value) {
      return value;
    },

    decodeValue: function (value) {
      return value;
    },

    // TODO not safe if `from` and `to` are the same
    // TODO error checking (e.g. for out of bounds)
    copy: function (from, to, to_start, from_start, from_end) {
      while (from_start < from_end) {
        to[to_start] = from[from_start];
        ++to_start;
        ++from_start;
      }
    },

    concat: function (outer, len) {
      if (outer.length === 1) {
        return outer[0];

      } else {
        // TODO use info.constructor
        var output = new Array(len);
        var output_i = 0;

        for (var outer_i = 0; outer_i < outer.length; ++outer_i) {
          var inner = outer[outer_i];

          for (var inner_i = 0; inner_i < inner.length; ++inner_i) {
            output[output_i] = inner[inner_i];
            ++output_i;
          }
        }

        return output;
      }
    },

    get: function (key) {
      return dict.get(key, undefined);
    },

    batch: function (ops) {
      ops ..@each(function (op) {
        var type  = op.type;
        var key   = op.key;
        var value = op.value;

        if (key == null) {
          throw new Error("Key cannot be null: " + key);
        }

        if (type === 'put') {
          dict = dict.set(key, value);

        } else if (type === 'del') {
          dict = dict.remove(key);

        } else {
          throw new Error("Unknown type: " + type);
        }
      });

      save_db(dict, options);

      MutationEmitter.emit(ops);
    },

    query: function (info) {
      return @Stream(function (emit) {
        dict.range(info) ..@each(emit);
      });
    }
  };
}

function load_db1(dict, input) {
  return JSON.parse(input) ..@reduce(dict, function (dict, [key, value]) {
    return dict.set(key, value);
  });
}

function load_db(options) {
  if (options.localStorage != null) {
    return get_cache(cache_localStorage, options.localStorage, function () {
      var dict = SortedDict();

      var db = localStorage[options.localStorage];
      if (db) {
        dict = load_db1(dict, db);
      }

      return @util.wrapDB(wrap_dict(dict, options));
    });

  } else if (options.file != null) {
    return get_cache(cache_file, options.file, function () {
      var dict = SortedDict();

      // TODO is there a better way of dealing with the file not existing ?
      try {
        dict = load_db1(dict, @fs.readFile(options.file, 'utf8'));
      } catch (e) {
        if (e.code !== 'ENOENT') {
          throw e;
        }
      }

      return @util.wrapDB(wrap_dict(dict, options));
    });

  } else {
    return @util.wrapDB(wrap_dict(SortedDict(), options));
  }
}

function LocalDB(options) {
  if (options.localStorage != null && options.file != null) {
    throw new Error("Cannot specify both localStorage and file at the same time");
  }

  if (options.file != null) {
    // TODO is path.resolve correct ?
    options.file = @path.resolve(options.file);
  }

  return load_db(options);
}
exports.LocalDB = LocalDB;
