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

var { ownPropertyPairs, hasOwn } = require('sjs:object');
var { each, filter, integers } = require('sjs:sequence');
var { isArrayLike } = require('sjs:array');

/** @nodoc
TODO: document
*/

//----------------------------------------------------------------------
// 

// XXX this function used only in gcd.sjs is incomplete; it should
// traverse the schema and set default values for nested values too
__js function instantiate(schema) {
  var rv = {};
  // set any default values:
  ownPropertyPairs(schema) .. each {
    |[name, value]|
    if (value && value.__defval)
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
  function inner(schema, schema_path, in_array) {
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
      path:          schema_path,
      in_array:      in_array
    };
    
    block(descriptor);
    
    switch (type) {
    case 'object':
      ownPropertyPairs(schema) .. 
        filter([name] -> name.indexOf('__') !== 0) ..
        each { 
          |[name, subschema]|
          inner(subschema, 
                schema_path==='' ? name : schema_path + '.' + name, in_array);
        }
      break;
    case 'array':
      var arr_elem_schema = isArrayLike(schema) ? schema[0] : schema.__elems;
      inner(arr_elem_schema, 
            schema_path + '.[]', true);
      break;
    }
  }
  inner(schema, '', false);
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
   @function setSchemaPath
   foo.[] = x
   
*/
function setSchemaPath(subject, path, value) {
  var parts = Array.isArray(path) ? path : path.split(".");
  
  if (!parts.length || parts.length === 1 && parts[0] === '')
    return value;
  var rv = subject;
  for (var i=0; i<parts.length-1; ++i) {
    if (parts[i] === '[]') {
      if (!isArrayLike(subject)) throw new Error("Unexpected non-array type encountered at '#{parts[i-1]}' while traversing object");
      if (subject.length === 0) {
        subject.push({});
        subject = subject[0];
      }
      else {
        subject = subject[0];
        if (typeof subject !== 'object')
          throw new Error("Unexpected non-object type encountered at '#{parts[i]}' while traversing object");
      }
    }
    else {
      if (subject[parts[i]] === undefined) {
        subject = subject[parts[i]] = (parts[i+1] === '[]') ? [] : {};
      }
      else {
        subject = subject[parts[i]];
        if (typeof subject !== 'object')
          throw new Error("Unexpected non-object type encountered at '#{parts[i]}' while traversing object");
      }
    }
  }
  if (parts[parts.length-1] === '[]') {
    if (!isArrayLike(subject)) throw new Error("Unexpected non-array type encountered at '#{parts[i-1]}' while traversing object");
    if (subject.length === 0)
      subject.push(value);
    else
      subject[0] = value;
  }
  else
    subject[parts[parts.length-1]] = value;
  return rv;
};
exports.setSchemaPath = setSchemaPath;

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
        throw new Error("Schema error: unknown type '#{schema}' (property: '#{property_name}', path: '#{path}')");
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
      if (node.value instanceof Object) {
        ownPropertyPairs(schema) .. 
        filter([name] -> name.indexOf('__') !== 0) ..
        each { 
          |[name, subschema]|
          inner(node.value, 
                path === '' ? name : path + '.' + name,
                name,
                node.state,
                subschema, 
                schema_path==='' ? name : schema_path + '.' + name);
        }
      }
      break;
    case 'array':
      if (isArrayLike(node.value)) {
        var arr_elem_schema = isArrayLike(schema) ? schema[0] : schema.__elems;
        integers(0,node.value.length-1) ..
        each {
          |i|
          inner(node.value, 
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
// gcd specific?

var simple_types = {
  'integer': true,
  'bool': true,
  'float': true,
  'string': true,
  'text': true,
  'date': true
};

function isSimpleType(t) {
  return simple_types .. hasOwn(t);
}
exports.isSimpleType = isSimpleType;


function KeyToId(path) {
  var matches = /\:([^\:\/]+)$/.exec(path);
  return matches ? matches[1] : null;
}
exports.KeyToId = KeyToId;

function IdToKey(id, kind, schema) {
  schema = schema[kind];
  if (!schema) throw new Error("Schema #{kind} not found");
  var key = '';
  if (schema.__parent)
    key += schema.__parent + '/';
  key += kind + ':' + id;
  return key;
}
exports.IdToKey = IdToKey;

function KeyToKind(key) {
  var parts = key.split('/');
  var matches = /^([^\:]+)\:/.exec(parts[parts.length-1]);
  return matches ? matches[1] : null;
}
exports.KeyToKind = KeyToKind;

function KeyToRootId(key) {
  var matches = /^[^\:]+\:([^\:\/]+)/.exec(key);
  return matches ? matches[1] : null;
}
exports.KeyToRootId = KeyToRootId;

function KeyToParentKey(key) {
  var matches = /^([^\/]+)\/[^\/]+$/.exec(key);
  return matches ? matches[1] : null;
}
exports.KeyToParentKey = KeyToParentKey;
