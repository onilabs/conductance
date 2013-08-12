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


function traverse(obj, schema, block) {

  function inner(parent, property_name, schema, schema_path) {
    var type = schema ? schema.__type;
    if (!type) {
      if (isArrayLike(schema)) 
        type = 'array';
      else if (typeof schema === 'object')
        type = 'obj';
      else
        throw new Error("Schema error: unknown type '#{schema}' (property: '#{property_name}')");
    }
    
    block({ parent:        parent, 
            property_name: property_name, 
            value:         parent[property_name],
            type:          type, 
            schema:        schema, 
            schema_path:   schema_path});
    
    switch (type) {
    case 'obj':
      if (parent[property_name] !== undefined) {
        propertyPairs(schema) .. 
        filter([name] -> name.indexOf('__') !== 0) ..
        each { 
          |[name, subschema]|
          inner(parent[property_name], name, 
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
          inner(parent[property_name], i, arr_elem_schema, schema_path + '.[]');
        }
      }
      break;    
    }
  }

  inner({root:obj}, 'root', schema, '');
}
exports.traverse = traverse;

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
  var matches = /\.([^\.\/]+)$/.exec(path);
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
