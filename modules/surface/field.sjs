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
@summary HTML 'Field' abstraction 
@hostenv xbrowser
@desc
  Fields are an abstraction that helps in the construction of UIs 
  that manipulate structured JS values. XXX Expand
*/

module.setCanonicalId('mho:surface/field');

var { hostenv } = require('builtin:apollo-sys');

if (hostenv !== 'xbrowser') 
  throw new Error('The mho:surface/field module can currently only be used in an xbrowser hostenv');

@ = require([
  'sjs:std',
  {id:'./base', include: ['Mechanism']},
  {id:'./dynamic', include: ['appendContent', 'removeNode']},
  {id:'sjs:type', include: ['Interface']}
]);


//----------------------------------------------------------------------
// General 'Context' helpers 
// XXX these should go elsewhere, surface/dynamic maybe? Or possibly not
// exposed for general consumption at all


// helpers
function findNodeWithContext(node, ctx) {
  @dom.traverseDOM(node, document) {
    |node|
    if (node[ctx] !== undefined) return node;
  }
  return undefined;
}

/**
   @function findContext
   @summary XXX write me
*/
function findContext(node, ctx, defval) {
  @dom.traverseDOM(node, document) {
    |node|
    if (node[ctx] !== undefined) return node[ctx];
  }
  return defval;
}
exports.findContext = findContext;


//----------------------------------------------------------------------
// Interfaces:

/**
   @variable CTX_FIELD
   @summary An [sjs:type::Interface] implemented by [::Field] DOM objects.
   @desc     
   A DOM object `obj` implementing CTX_FIELD promises to have 
   the following functions defined:
   
       obj[CTX_FIELD] = {
         id:               String, // document unique id
         value:            ObservableVar,
         validation_state: Observable,
         auto_validate   : ObservableVar,
         validators:       Array,
         validators_deps:  Object,
         validate:         Function
       }

      `validation_state` is an object

       {
         state:  'unknown'|'error'|'warning'|'success',
         errors: Array of Strings,
         warnings: Array of Strings
       }

       CTX_FIELDCONTAINER is an internal implementation detail that might
       change in future. Client code should never call the functions listed
       above directly, but instead use the API function in the [./field::] 
       module.
*/
var CTX_FIELD = exports.CTX_FIELD = @Interface(module, "ctx_field");


/**
   @variable CTX_FIELDCONTAINER
   @summary An [sjs:type::Interface] implemented by [::FieldContainer] DOM objects. 
   @desc     
       A DOM object `obj` implementing CTX_FIELDCONTAINER promises to have 
       the following functions defined:
       
       obj[CTX_FIELDCONTAINER] = {
       getField: function(name),
       addField: function(name, node),
       removeField: function(name, node)
       }

       CTX_FIELDCONTAINER is an internal implementation detail that might
       change in future. Client code should never call the functions listed
       above directly, but instead use the API function in the [./field::] 
       module.
*/
var CTX_FIELDCONTAINER = exports.CTX_FIELDCONTAINER = @Interface(module, "ctx_fieldcontainer");


//----------------------------------------------------------------------
// Field API:

/**
   @function fieldValue
   @summary XXX write me
*/
function fieldValue(node) {
  var ctx = node .. findContext(CTX_FIELD);
  if (!ctx) throw new Error("fieldValue: node #{node} is not part of a Field");
  return ctx.value;
}
exports.fieldValue = fieldValue;

/**
   @function validate
   @summary XXX write me
*/
function validate(node) {
  var ctx = node .. findContext(CTX_FIELD);
  if (!ctx) throw new Error("validate: node #{node} is not part of a Field");
  return ctx.validate();
}
exports.validate = validate;

/**
   @function validationState
   @summary XXX write me
*/
function validationState(node) {
  var ctx = node .. findContext(CTX_FIELD);
  if (!ctx) throw new Error("validationState: node #{node} is not part of a Field");
  return ctx.validation_state;
}
exports.validationState = validationState;

/**
   @function getField
   @summary XXX write me
*/
function getField(node, path) {
  
  // XXX is this a good idea? Always asynchronize so that 'getField'
  // works from ancestor mechanisms:
  hold(0);
  
  node = node .. findNodeWithContext(CTX_FIELD);
  if (path && path.length) {
    if (!node[CTX_FIELDCONTAINER])
      node = node .. findNodeWithContext(CTX_FIELDCONTAINER);
    
    path.split('/') .. @each { 
      |component|
      if (component === '.') {
        // nothing to be done
      }
      else if (component === '..') {
        node = node.parentNode .. findNodeWithContext(CTX_FIELDCONTAINER);
      }
      else
        node = node[CTX_FIELDCONTAINER].getField(component);
    }
  }
  return node;
}
exports.getField = getField;


//----------------------------------------------------------------------
// HTML element decorators


/**
   @function Field
   @summary XXX write me
*/

var field_id_counter = 0;


function run_validators(field) {
  var errors = [], warnings = [];
  // execute the validators in parallel, but obtain an ordered
  // results set:
  field.validators .. @transform.par(v -> v(field.value .. @current)) .. @each {
    |validation_result|
    if (validation_result === true) continue;
    if (typeof validation_result === 'string')
      errors.push(validation_result);
    if (typeof validation_result === 'object') {
      if (validation_result.error)
        errors.push(validation_result.error);
      else if (validation_result.warning)
        warnings.push(validation_result.warning);
    }
    else
      errors.push("Unspecified validation error");
  }
  
  return { errors: errors, warnings: warnings };
}

function validate_field() {
  var field = this;
  var val = field.value .. @current;
  
  waitfor {
    var {errors, warnings} = field .. run_validators();
  }
  or {
    // if the validators don't return immediately, we reset
    // the validation_state to 'unknown':
    if ((field.validation_state .. @current).state !== 'unknown')
      field.validation_state.set({state:'unknown'});
    hold();
  }
  var state;
  if (errors.length)
    state = 'error';
  else if (warnings.length)
    state = 'warning';
  else
    state = 'success';
  var rv = {state: state, errors: errors, warnings: warnings};
  field.validation_state.set(rv);
  return rv;
}


var Field = (elem, name, startval) ->
  elem ..
  @Mechanism(function(node) {
    
    var field = node[CTX_FIELD] = {
      id: "__oni_field_#{++field_id_counter}",
      
      value: @ObservableVar(startval === undefined ? '' : startval),
      
      validation_state: @ObservableVar({state:'unknown'}),
      auto_validate: @ObservableVar(false),
      validators: [],
      validators_deps: {},
      validate: validate_field
    };
    
    var container = node.parentNode .. findContext(CTX_FIELDCONTAINER);
    
    try {
      if (container) 
        container.addField(name, node);
      
      // asynchronize so that tree gets built before we start validating:
      hold(0);
      
      field.auto_validate .. @each.track {
        |flag|
        if (!flag) continue;
        field.value .. @each.track {
          ||
          field.validate();
        }
      }
    }
    finally {
      if (container)
        container.removeField(name, node);
    }
  }, true /* we PREPEND this mechanism, so that ContextualInputMechanism works correctly, even when setting Field  directly on an input element */);
exports.Field = Field;


/**
   @function FieldMap
   @summary XXX write me
*/

var FieldMap = (elem, name) ->
  elem ..
  @Mechanism(function(node) {
    var fieldmap = {};
    
    var value = @Stream(function(r) {
      var args = @propertyPairs(fieldmap) .. @map([,subfield] -> subfield[CTX_FIELD].value);
      // the hold(0) is necessary so that we don't get individual notifications when setting several 
      // subfields in a temporally contiguous block
      args.push(-> (hold(0),@zip(@keys(fieldmap), arguments) .. @pairsToObject));
      @observe.apply(null, args) .. @each {|x| r(x) }
    }) .. @mirror;
    
    value.set = function(x) {
      @propertyPairs(x) .. @each {
        |[key,val]|
        var subfield = fieldmap[key];
        if (!subfield) continue;
        subfield[CTX_FIELD].value.set(val);
      }
    }
    
    var validation_state = @Stream(function(r) {
      var args = @propertyPairs(fieldmap) .. @map([,subfield] -> subfield[CTX_FIELD].validation_state);
      args.push(function() {
        // collect multiple contiguous notifications:
        hold(0);
        var unknowns = false;
        
        var {errors, warnings} = field .. run_validators();
        
        // collect childrens' validation states:
        @zip(@keys(fieldmap), arguments) .. @each {
          |[key, child_state]|
          switch (child_state.state) {
          case 'unknown':
            unknowns = true;
            break;
          case 'error':
            errors.push({key:key, errors: child_state.errors});
            if (!child_state.warnings.length) break;
            // else fall through
          case 'warning':
            warnings.push({key:key, warnings: child_state.warnings});
          }
        }
        var state;
        if (errors.length) 
          state = 'error';
        else if (warnings.length)
          state = 'warning';
        else if (unknowns)
          state = 'unknown';
        else
          state = 'success';
        return { state: state, errors: errors, warnings: warnings};
      });
      
      @observe.apply(null, args) .. @each {|x| r(x) }
    }) .. @mirror;
    
    
    var field = node[CTX_FIELD] = {
      id: "__oni_field_#{++field_id_counter}",
      
      value: value,
      
      validation_state: validation_state,
      validators: [],
      validators_deps: {},
      validate: function() { 
        console.log('XXX write me'); 
      }
    };
    
    node[CTX_FIELDCONTAINER] = {
      getField: function(name) { return fieldmap[name]; },
      addField: function(name, field_node) {
        if (!name) throw new Error("Fields added to FieldMap require a name");
        if (fieldmap[name]) throw new Error("Multiple instances of field '#{name}' in FieldMap.");
        
        fieldmap[name] = field_node;
      },
      removeField: function(name, field_node) {
        var entry = fieldmap[name];
        if (!entry) throw new Error("Field '#{name}' not found in FieldMap");
        delete fieldmap[name];
      }
    };
    
    // register with our container if there is one:
    var container = node.parentNode .. findContext(CTX_FIELDCONTAINER);
    
    if (container) {
      try {
        container.addField(name, node);
        hold();
      }
      finally {
        container.removeField(name, node);
      }
    }
    
  });
exports.FieldMap = FieldMap;


/**
   @function FieldArray
   @summary XXX write me
*/

var FieldArrayItem = (elem, i) ->
  elem ..
  @Mechanism(function(node) {
    // we allow for node to be an unamed FieldMap or generic HTML
    // in the latter case we need to add a CTX_FIELD interface:
    if (!node[CTX_FIELD]) {
      // inject a field
      throw new Error("FieldArrays currently only support FieldMap children");
      node[CTX_FIELD] = {
        // XXX
      };
    }
  });

var FieldArray = (elem, template, name) ->
  elem ..
  @Mechanism(function(node) {
    
    var fieldarray = [];
    var array_mutation_emitter = @Emitter();
    
    var value = @Stream(function(r) { 
      while (1) {
        waitfor {
          if (!fieldarray.length) { r([]); hold(); }
          var args = fieldarray .. @map(field -> field[CTX_FIELD].value);
          // the hold(0) is necessary so that we don't get individual notifications when setting several
          // fields in a temporally contiguous block
          args.push(-> (hold(0),arguments .. @toArray));
          @observe.apply(null, args) .. @each {|x| r(x) }
        }
        or {
          array_mutation_emitter .. @wait;
        } 
      }
    }) .. @mirror;
    
    value.set = function(x) { 
      var array_mutation = false;
      x .. @indexed .. @each { |[i,val]|
        if (!fieldarray[i]) { 
          array_mutation = true;
          var inserted = (node .. @appendContent(template));
          fieldarray[i] = inserted[0];
        }
        fieldarray[i][CTX_FIELD].value.set(val);
      }
      while ( fieldarray.length > x.length) {
        array_mutation = true;
        fieldarray.pop() .. @removeNode();
      }
      if (array_mutation) array_mutation_emitter.emit();
    };
    
    var field = node[CTX_FIELD] = {
      id: "__oni_field_#{++field_id_counter}",
      
      value: value,
      
      validation_state: @ObservableVar({state:'unknown'}), // XXX
      validators: [],
      validators_deps: {},
      validate: function() { /* XXX */ }
    };
    
    // fieldcontainer for our array items
    node[CTX_FIELDCONTAINER] = {
      getField: function(name) { /* XXX */ },
      addField: function(name, field_node) { 
        // sanity check:
        if (name) throw new Error("A FieldArray template must not contain a named Field");
      },
      removeField: function(name, field_node) {
        var idx = fieldarray.indexOf(field_node);
        if (idx == -1) return; // already removed (from value.set) or we don't know about it
        fieldarray.splice(idx,1);
        array_mutation_emitter.emit();
      }
    };
    
    var container = node.parentNode .. findContext(CTX_FIELDCONTAINER);
    
    try {
      //console.log("Registering #{name} -> #{node}");
      if (container)
        container.addField(name, node);
      hold();
    }
    finally {
      if (container)
        container.removeField(name, node);
    }
    
    
  });

exports.FieldArray = FieldArray;
      

/**
   @function Validate
   @summary XXX write me
*/

var Validate = (elem, validator) ->
  elem ..
  @Mechanism(function(node) {
    var field = node .. findContext(CTX_FIELD);
    if (!field) throw new Error("'Validate' decorator outside of a Field");
    field.validators.push(validator);
    if (validator .. @isArrayLike) {
      validator[0] .. @each { |dep| field.validators_deps[dep] = true }
    }
  });
exports.Validate = Validate;
