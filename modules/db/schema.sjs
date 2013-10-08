var { propertyPairs } = require('sjs:object');
var { each, filter, integers } = require('sjs:sequence');
var { isArrayLike } = require('sjs:array');

//----------------------------------------------------------------------
// 

function instantiate(schema) {
  var rv = {};
  // set any default values:
  propertyPairs(schema) .. each {
    |[name, value]|
    if (value.__defval)
      rv[name] = value.__defval;
  }
  return rv;
}
exports.instantiate = instantiate;

//----------------------------------------------------------------------

/**
   @function traverse
*/
function traverse(schema, block) {
  function inner(schema, schema_path) {
    var type = schema ? schema.__type;
    if (!type) {
      if (isArrayLike(schema)) 
        type = 'array';
      else if (typeof schema === 'object')
        type = 'object';
      else
        throw new Error("Schema error: unknown type '#{schema}' (path: '#{schema_path}')");
    }
    
    var descriptor = {
      type:          type,
      value:         schema, 
      path:          schema_path
    };
    
    block(descriptor);
    
    switch (type) {
    case 'object':
      propertyPairs(schema) .. 
        filter([name] -> name.indexOf('__') !== 0) ..
        each { 
          |[name, subschema]|
          inner(subschema, 
                schema_path==='' ? name : schema_path + '.' + name);
        }
      break;
    case 'array':
      var arr_elem_schema = isArrayLike(schema) ? schema[0] : schema.__elems;
      inner(arr_elem_schema, 
            schema_path + '.[]');
      break;
    }
  }
  inner(schema, '');
}
exports.traverse = traverse;

/**
   @function getAttribute
*/
exports.getAttribute = function(schema, attr) {
  traverse(schema) {
    |descriptor|
    if (descriptor.value[attr]) return descriptor.value[attr];
  }
  return undefined;
};

/**
   @function containsType
*/
exports.containsType = function(schema, type) {
  traverse(schema) {
    |descriptor|
    if (descriptor.type == type) return true;
  }
  return false;
};

//----------------------------------------------------------------------

/**
   @function cotraverse
*/
function cotraverse(obj, schema, block) {

  function inner(parent, path, property_name, parent_state, schema, schema_path) {
    var type = schema ? schema.__type;
    if (!type) {
      if (isArrayLike(schema)) 
        type = 'array';
      else if (typeof schema === 'object')
        type = 'object';
      else
        throw new Error("Schema error: unknown type '#{schema}' (property: '#{property_name}')");
    }
    
    var node = { 
      parent:        parent, 
      property:      property_name, 
      value:         parent[property_name],
      path:          path, 
      parent_state:  parent_state
    };

    var descriptor = {
      type:          type,
      value:         schema, 
      path:          schema_path
    };
    
    block(node, descriptor);
    
    switch (type) {
    case 'object':
      if (parent[property_name] !== undefined) {
        propertyPairs(schema) .. 
        filter([name] -> name.indexOf('__') !== 0) ..
        each { 
          |[name, subschema]|
          inner(parent[property_name], 
                path === '' ? name : path + '.' + name,
                name,
                node.state,
                subschema, 
                schema_path==='' ? name : schema_path + '.' + name);
        }
      }
      break;
    case 'array':
      if (isArrayLike(parent[property_name])) {
        var arr_elem_schema = isArrayLike(schema) ? schema[0] : schema.__elems;
        integers(0,parent[property_name].length-1) ..
        each {
          |i|
          inner(parent[property_name], 
                path + '.' + i, 
                i,
                node.state,
                arr_elem_schema, 
                schema_path + '.[]');
        }
      }
      break;
    }
  }

  inner({root:obj}, '', 'root', undefined, schema, '');
}
exports.cotraverse = cotraverse;

//----------------------------------------------------------------------

var simple_types = {
  'integer': true,
  'bool': true,
  'float': true,
  'string': true,
  'text': true,
  'date': true
};

function isSimpleType(t) {
  return t in simple_types;
}
exports.isSimpleType = isSimpleType;

//----------------------------------------------------------------------
// gcd specific?

function KeyToId(path) {
  var matches = /\:([^\:\/]+)$/.exec(path);
  return matches ? matches[1] : null;
}
exports.KeyToId = KeyToId;

function IdToKey(id, schema) {
  var key = '';
  if (schema.__parent)
    key += schema.__parent + '/';
  if (!schema.__kind)
    throw new Error("Schema missing '__kind' definition");
  key += schema.__kind + ':' + id;
  return key;
}
exports.IdToKey = IdToKey;
