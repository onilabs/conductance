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
      if (validation_result.warning)
        warnings.push(validation_result.warning);
      if (validation_result.errors)
        errors = errors.concat(validation_result.errors);
      if (validation_result.warnings)
        warnings = warnings.concat(validation_result.warnings);
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
    hold(100);
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
    
    var parent_container = node.parentNode .. findContext(CTX_FIELDCONTAINER);
    
    try {
      if (parent_container) 
        parent_container.addField(name, node);
      
      // asynchronize so that tree gets built before we start validating:
      hold(0);
      
      field.auto_validate .. @each.track {
        |flag|
        field.value .. @each.track {
          ||
          if (flag) {
            // validate whenever value changes
            field.validate();
          }
          else {
            // reset to 'unknown' whenever value changes
            field.validation_state.modify(state -> state.state === 'unknown' ? state : {state: 'unknown', errors:[], warnings:[]});
          }
        }
      }
    }
    finally {
      if (parent_container)
        parent_container.removeField(name, node);
    }
  }, true /* we PREPEND this mechanism, so that Mechanisms that search for a Field interface (like ContextualInputMechanism) works correctly, even when the Field interface and the Mechanism depending on the Field are on the same element */);
exports.Field = Field;


/**
   @function FieldMap
   @summary XXX write me
*/

var FieldMap = (elem) ->
  elem ..
  @Mechanism(function(node) {

    var field = node .. findContext(CTX_FIELD);
    if (!field) throw new Error("FieldMap must be contained in a Field");
    // XXX maybe instantiate a field on us if there isn't one?

    var fieldmap = {};
    var field_mutation_emitter = @Emitter();
        
    node[CTX_FIELDCONTAINER] = {
      getField: function(name) { return fieldmap[name]; },
      addField: function(name, field_node) {
        if (!name) throw new Error("Fields added to FieldMap require a name");
        if (fieldmap[name]) throw new Error("Multiple instances of field '#{name}' in FieldMap.");
        
        fieldmap[name] = field_node;
        field_mutation_emitter.emit();
      },
      removeField: function(name, field_node) {
        var entry = fieldmap[name];
        if (!entry) throw new Error("Field '#{name}' not found in FieldMap");
        delete fieldmap[name];
        field_mutation_emitter.emit();
      }
    };


    var current_value = undefined;

    waitfor {
      // Keep our associated observable up to date:
      while (1) {
        waitfor {
          var args = @propertyPairs(fieldmap) .. @map([,subfield] -> subfield[CTX_FIELD].value);
          
          if (args.length === 0) {
            current_value = {};
            field.value.set(current_value);
            hold();
          }
          
          // the hold(0) is necessary so that we don't get individual notifications when setting several 
          // subfields in a temporally contiguous block
          args.push(-> (hold(0),@zip(@keys(fieldmap), arguments) .. @pairsToObject));
          @observe.apply(null, args) .. @each {
            |x| 
            current_value = x;
            field.value.set(current_value);
          }
        }
        or {
          field_mutation_emitter .. @wait;
        }
      }
    }
    and {
      // Propagate changes from our associated observable to our
      // children:
      field.value .. @each {
        |x|
        if (x === current_value) continue;
        @propertyPairs(x) .. @each {
          |[key,val]|
          var subfield = fieldmap[key];
          if (!subfield) continue;
          subfield[CTX_FIELD].value.set(val);
        }
      }
    }
    and {
      // add validator to the field:
      field.validators.push(function() {
        var errors = [], warnings = [];
        @propertyPairs(fieldmap) .. 
          @transform.par([key,subfield] -> [key, subfield[CTX_FIELD].validate()]) .. @each {
            |[key,state]|
            if (state.errors.length)
              errors.push({key:key, errors: state.errors});
            if (state.warnings.length)
              warnings.push({key:key, warnings: state.warnings});
          }
        return {errors: errors, warnings: warnings};
      });
      // XXX could remove validator in finally clause
    }
  });
exports.FieldMap = FieldMap;


/**
   @function FieldArray
   @summary XXX write me
*/

var FieldArray = (elem, template) ->
  elem ..
  @Mechanism(function(node) {

    var field = node .. findContext(CTX_FIELD);
    if (!field) throw new Error("FieldArray must be contained in a Field");
    // XXX maybe instantiate a field on us if there isn't one?

    var fieldarray = [];
    var array_mutation_emitter = @Emitter();
        
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
    
    var current_value = undefined;
    waitfor {
      // Keep our associated observable up to date:
      while (1) {
        waitfor {
          if (!fieldarray.length) { 
            current_value = []; 
            field.value.set(current_value); 
            hold(); 
          }
          var args = fieldarray .. @map(field -> field[CTX_FIELD].value);
          // the hold(0) is necessary so that we don't get individual
          // notifications when setting several fields in a temporally
          // contiguous block
          args.push(-> (hold(0),arguments .. @toArray));
          @observe.apply(null, args) .. @each {
            |x|
            current_value = x;
            field.value.set(current_value);
          }
        }
        or {
          array_mutation_emitter .. @wait;
        } 
      }
    }
    and {
      // Propagate changes from our associated observable to our
      // children:
      field.value .. @each {
        |x|
        if (x === current_value) continue;
        var array_mutation = false;
        x .. @indexed .. @each { |[i,val]|
          if (!fieldarray[i]) { 
            array_mutation = true;
            var inserted = (node .. @appendContent(template .. Field()));
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
    }
    and {
      // add validator to the field:
      field.validators.push(function() {
        var errors = [], warnings = [];
        fieldarray .. @indexed .. 
          @transform.par([key, subfield] -> [key, subfield[CTX_FIELD].validate()]) .. 
          @each {
            |[key,state]|
            if (state.errors.length)
              errors.push({key:key, errors: state.errors});
            if (state.warnings.length)
              warnings.push({key:key, warnings: state.warnings});
          }
        return {errors: errors, warnings: warnings};
      });
      // XXX could remove validator in finally clause
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
    // XXX could remove validator in finally clause
  });
exports.Validate = Validate;
