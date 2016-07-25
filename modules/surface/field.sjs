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
  Fields are an abstraction that helps in the construction of form-like UIs.
*/

module.setCanonicalId('mho:surface/field');

var { hostenv } = require('builtin:apollo-sys');

if (hostenv !== 'xbrowser') 
  throw new Error('The mho:surface/field module can currently only be used in an xbrowser hostenv');

@ = require([
  'sjs:std',
  {id:'./base', include: ['Mechanism', 'MECH_PRIORITY_API', 'MECH_PRIORITY_STREAM', 'MECH_PRIORITY_NORMAL']},
  {id:'./dynamic', include: ['appendContent', 'removeNode']},
  {id:'sjs:type', include: ['Interface']},
  {id:'./nodes', include: ['getDOMNode', 'getDOMITF', 'getDOMITFNode']}
]);

var MECH_PRIORITY_FIELD_API = @MECH_PRIORITY_API;
var MECH_PRIORITY_FIELD_CONTAINER_API = @MECH_PRIORITY_API;
var MECH_PRIORITY_FIELD_SYNC = @MECH_PRIORITY_STREAM-1; // starting synchronization before stream priority means that an initialized 'Value' is available for streaming
var MECH_PRIORITY_FIELD_CONTAINER_SYNC = @MECH_PRIORITY_STREAM-1;

//----------------------------------------------------------------------
// Interfaces:

/**
   @variable ITF_FIELD
   @summary An [sjs:type::Interface] implemented by [::Field] DOM objects.
   @desc
     A DOM object `obj` implementing ITF_FIELD promises to have 
     the following interface defined:
   
         obj[ITF_FIELD] = {
           id:               String, // document unique id
           value:            ObservableVar,
           validation_state: Observable,
           display_validation   : ObservableVar,
           addValidator: function(obj),
           removeValidator: function(obj),
           validators:       Array, // current set of validators;managed by add/remove functions above
           validators_deps:  Object // current set of validators_deps ;managed by add/remove functions above
         }

     `validation_state` is an object

         {
           state:  'unknown'|'error'|'warning'|'success',
           errors: Array of Strings,
           warnings: Array of Strings
         }

     ITF_FIELD is an internal implementation detail that might
     change in future. Client code should never call the functions listed
     above directly, but instead use the API function in the [./field::] 
     module.
*/
var ITF_FIELD = exports.ITF_FIELD = @Interface(module, "itf_field");


/**
   @variable ITF_FIELDCONTAINER
   @summary An [sjs:type::Interface] implemented by [::FieldArray] and [::FieldMap] DOM objects. 
   @desc     
       A DOM object `obj` implementing ITF_FIELDCONTAINER promises to have 
       the following interface defined:
       
           obj[ITF_FIELDCONTAINER] = {
             getField: function(name),
             addField: function(name, node),
             removeField: function(name, node)
           }

       ITF_FIELDCONTAINER is an internal implementation detail that might
       change in future. Client code should never call the functions listed
       above directly, but instead use the API function in the [./field::] 
       module.
*/
var ITF_FIELDCONTAINER = exports.ITF_FIELDCONTAINER = @Interface(module, "itf_fieldcontainer");


//----------------------------------------------------------------------
// Field API:

/**
   @function Value
   @summary Return the 'Value' [sjs:observable::ObservableVar] for a field
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy; see [::getField]
   @demo
       @ =  require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'},
       {id:'mho:surface/field', name:'field'}]);

       var demo = @demo.CodeResult("\
         @field.Field() ::
           [
             @Input(),
             `<br>The value is: '${@field.Value()}'<br>`,
             @Button('Capitalize') .. 
               @OnClick(-> @field.Value().modify(x->x.toUpperCase())),
           ]
       ",
         @field.Field({initval:'foo'}) ::
           [
             @Input(),
             `<br>The value is: '${@field.Value()}'<br>`,
             @Button("Capitalize") .. @OnClick(-> @field.Value().modify(x->x.toUpperCase())),
           ]
       );
       

       @mainContent .. @appendContent(demo);
     
*/
function Value(/*[node], [path]*/) {

  var args = arguments;
  
  var stream = @Observable(function(r) {
    var field_node = getField.apply(null, args);
    if (!field_node) throw new Error("field::Value: Cannot resolve Field");
    field_node[ITF_FIELD].value .. @each(r);
  });
  // XXX amend stream to be an observable var:
  stream.set = function(v) {
    var field_node = getField.apply(null, args);
    if (!field_node) throw new Error("field::Value: Cannot resolve Field");
    return field_node[ITF_FIELD].value.set(v);
  };
  stream.modify = function(f) {
    var field_node = getField.apply(null, args);
    if (!field_node) throw new Error("field::Value: Cannot resolve Field");
    return field_node[ITF_FIELD].value.modify(f);
  };
  stream.__oni_is_ObservableVar = true;

  return stream;
}
exports.Value = Value;

/**
   @function validate
   @altsyntax node .. validate
   @summary Wait for and return decisive (i.e. not 'unknown') validation result for a field & turn on displaying of validation results
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy; see [::getField]

*/

//helper:
function waitforDecisiveValidationState(field) {
  field.validation_state .. @each {
    |validation|
    if (validation.state !== 'unknown')
      return validation;
  }
}

function validate(/*[node], [path]*/) {
  var field_node = getField.apply(null, arguments);
  if (!field_node) throw new Error("field::validate: Cannot resolve Field");
  field_node[ITF_FIELD].set_display_validation(true);
  return waitforDecisiveValidationState(field_node[ITF_FIELD]);
}
exports.validate = validate;

/**
   @function displayValidation
   @summary Turn displaying of validation results on or off
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy; see [::getField]
   @param {Boolean} [on]
*/
function displayValidation(/*[node], [path], on*/) {
  var args = arguments .. @toArray;
  var on = args.pop();
  var field_node = getField.apply(null, args);
  if (!field_node) throw new Error("field::displayValidation: Cannot resolve Field");
  field_node[ITF_FIELD].set_display_validation(on);
}
exports.displayValidation = displayValidation;

/**
   @function ValidationState
   @summary Return the validation state [sjs:observable::Observable] for a field
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy; see [::getField]
   @desc
     See [::Field] for an example.
*/
function ValidationState(/*[node], [path]*/) {

  var args = arguments;
  
  return @Stream(function(r) {
    var field_node = getField.apply(null, args);
    if (!field_node) throw new Error("field::ValidationState: Cannot resolve Field");
    field_node[ITF_FIELD].validation_state .. @each(r);
  });
}
exports.ValidationState = ValidationState;

/**
   @function ValidationDisplayFlag
   @summary Return the 'display validation flag' [sjs:observable::Observable] for a field
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy; see [::getField]
   @desc
      Returns a boolean observable. If 'true', validations for the given field should be displayed
*/
function ValidationDisplayFlag(/*[node], [path]*/) {

  var args = arguments;
  
  return @Stream(function(r) {
    var field_node = getField.apply(null, args);
    if (!field_node) throw new Error("field::ValidationDisplayFlag: Cannot resolve Field");
    field_node[ITF_FIELD].display_validation .. @each(r);
  });
}
exports.ValidationDisplayFlag = ValidationDisplayFlag;

/**
   @function Valid
   @summary Return an [sjs:observable::Observable] that is `true` if the field is valid, `false` otherwise
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy; see [::getField]
   @demo
       @ =  require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'},
       {id:'mho:surface/field', name:'field'}]);

       var demo = @demo.CodeResult("\
         @field.Field() .. 
           @field.Validate(x-> x.length > 4) ..
           @field.Validate(x-> x.toLowerCase() === x) :: 
             @Div :: 
               [
                  @ControlLabel('Username (min 5 chars, no caps)'),
                  @Input(),
                  @Button('Log in') .. @Enabled(@field.Valid())
               ]
       ",
         @field.Field() .. 
           @field.Validate(x-> x.length > 4) ..
           @field.Validate(x-> x.toLowerCase() === x) :: 
             @Div :: 
               [
                   @ControlLabel('Username (min 5 chars, no caps)'),
                   @Input(),
                   @Button('Log in') .. @Enabled(@field.Valid())
               ]
       );
       

       @mainContent .. @appendContent(demo);

*/
exports.Valid = function(/*[node], [path]*/) {
  return ValidationState.apply(null, arguments) ..
    @transform({state} -> state === 'success');
};

/**
   @function getField
   @summary Find a DOM node bound to a Field 
   @param {optional DOMNode} [node] DOM node with attached [::Field] or a child thereof; if `undefined`: use the implicit [../surface::DynamicDOMContext]
   @param {optional String} [path] Address of the field in a container hierarchy
   @desc
     If `path` is undefined, `getField` returns the closest parent that has a [::Field] attached.

     If specified, `path` identifies a particular field in a [::FieldMap] hierarchy. It is a string of Field names, '.' and
     '..' separated by slashes.

     ### Path examples:

     - `'./foo'`, `'/foo'` and `'foo'` all locate the Field named 'foo' located in the nearest enclosing
     FieldMap enclosing `node`.

     - `'foo/bar'` locates the field named 'bar' in the Field named 'foo' which is also expected to be a FieldMap and which in turn is contained in the same FieldMap as `node`.

     - `'../foo'` locates the field named 'foo' in the FieldMap that contains the FieldMap in which `node` is located.
*/
function getField(/*[node], [path]*/) {

  // untangle arguments:
  var node, path;
  if (arguments.length === 1) {
    if (typeof arguments[0] === 'string')
      path = arguments[0];
    else
      node = arguments[0];
  }
  else if (arguments.length === 2) {
    node = arguments[0];
    path = arguments[1];
  }
  else if (arguments.length !== 0)
    throw new Error("Surplus arguments supplied to getField()");

  if (node !== undefined) {
    if (!@dom.isDOMNode(node))
      throw new Error("Invalid argument to getField(); DOM node expected, #{node} given");
  }
  else {
    node = @getDOMNode();
  }
    
  if (!path && node[ITF_FIELD]) return node;
  
  node = node .. @getDOMITFNode(ITF_FIELD);
  if (path && path.length) {
    if (!node[ITF_FIELDCONTAINER])
      node = node .. @getDOMITFNode(ITF_FIELDCONTAINER);
    
    path.split('/') .. @each { 
      |component|
      if (component === '.') {
        // nothing to be done
      }
      else if (component === '..') {
        node = node.parentNode .. @getDOMITFNode(ITF_FIELDCONTAINER);
      }
      else
        node = node[ITF_FIELDCONTAINER].getField(component);
    }
  }
  
  if (node && !node[ITF_FIELD]) {
    // this is to resolve paths like '.':
    node = node .. @getDOMITFNode(ITF_FIELD);
  }
  
  return node;
}
exports.getField = getField;


//----------------------------------------------------------------------
// HTML element decorators


/**
   @function Field
   @altsyntax Field(element, name, [initval])
   @altsyntax // Postfix form:
   @altsyntax element .. Field([settings])
   @altsyntax element .. Field(name, [initval])
   @altsyntax // Prefix form:
   @altsyntax Field([settings]) :: element
   @altsyntax Field(name, [initval]) :: element
   @summary Decorate an element as a Field
   @param {../surface::Element} [element]
   @param {optional Object} [settings]
   @setting {optional String} [name] Name that this Field will have when contained in a [::FieldMap]
   @setting {optional Object} [initval] Initial value of the field
   @setting {optional sjs:observable::ObservableVar} [Value] [sjs:observable::ObservableVar] tracking the value of this field
   @setting {optional sjs:observable::ObservableVar} [ValidationState] [sjs:observable::ObservableVar] tracking the validation state of this field
   @desc
     A [../surface::Element] that is decorated as a Field creates a DOM node 
     implementing the [::ITF_FIELD] interface.
     
     It keeps track of a value and the validation state for this
     value. Certain DOM children, such as [./html::Input] or
     [./html::Label], as well as structural container nodes such as [::FieldMap] and [::FieldArray] 
     automatically "bind" to their enclosing field:

     A form control, such as [./html::Input], binds to the value
     of the field. When the field value is changed, the form control
     updates, and, conversely, when the form control receives user
     input, the field value updates.

     ### Validation

     The element decorated as a field, or any child thereof, can be
     annotated with 'validators', using the [::Validate] decorator.
     A validation of the current field value can be performed **explicitly** by
     using the [::validate] function. This applies all validators and returns
     and an object describing any errors and warnings. The validation object is 
     also accessible as an [sjs:observable::Observable] via the [::ValidationState] function.  

     Validation is also performed **implicitly** when the form element
     in a field receives user input. Once user input is received, a
     Field goes into 'auto-validation' mode, where each further change
     to the value causes a validation.
     
     [./bootstrap::FormGroup]s make use of the validation information to automatically
     mark up a form control based on the validation state. 

     ### IDs and Labels

     Fields also automatically set a generated 'id' attribute on their
     enclosed form control. Any enclosed [./html::Label] or [./bootstrap::ControlLabel] elements will
     automatically set their 'for' attribute to this id, such that
     clicking on them selects the form control.

   @demo
       @ =  require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'},
       {id:'mho:surface/field', name:'field'}]);

       var demo = @demo.CodeResult("\
         @field.Field() .. 
           @field.Validate(x-> x.length < 5 ? 'too few chars' : true) ..
           @field.Validate(x-> x.toLowerCase() == x ? true : 'no upper case') :: 
             @Div :: 
               [
                 @FormGroup() :: 
                   [
                     @ControlLabel('Username (min 5 chars, no caps)'),
                     @Input()
                   ],
                   
                 @field.ValidationState() .. @project(@inspect)
               ]
       ",
         @field.Field() .. 
           @field.Validate(x-> x.length < 5 ? 'too few chars' : true) ..
           @field.Validate(x-> x.toLowerCase() == x ? true : 'no upper case') :: 
             @Div :: 
               [
                 @FormGroup() :: 
                   [
                     @ControlLabel('Username (min 5 chars, no caps)'),
                     @Input()
                   ],
                   
                   @field.ValidationState() .. @project(@inspect)
               ]
       );
       

       @mainContent .. @appendContent(demo);
*/

var field_id_counter = 0;


function run_validators(field_node, validators, validators_deps) {
  var errors = [], warnings = [];

  // get current values for all of our dependencies:
  var our_value = field_node[ITF_FIELD].value .. @current;

  var deps = @ownPropertyPairs(validators_deps) ..
    @map([path] -> [path, (field_node .. getField(path))[ITF_FIELD].value .. @current]) .. @pairsToObject;

  // execute the validators in parallel, but obtain an ordered
  // results set:
  validators .. @transform.par(function(v) {
    if (typeof v === 'object') {
      // collect all deps, starting with our current value:
      var args = [our_value];
      v.deps .. @each { |dep| args.push(deps[dep]) }
      return v.validate.apply(null, args);
    }
    else {
      return v(our_value);
    }
  }) .. @each {
    |validation_result|
    if (validation_result === true) continue;
    if (typeof validation_result === 'string')
      errors.push(validation_result);
    else if (typeof validation_result === 'object') {
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

function validate_field_loop(field_node) {

  var field = field_node[ITF_FIELD];

  // determine our dependencies:
  var deps = @ownPropertyPairs(field.validators_deps) ..
    @map([path] -> (field_node .. getField(path))[ITF_FIELD].value);

  var validation_trigger;

  if (deps.length) {
    // add our own value:
    deps.push(field.value);
    // add a dummy transformer:
    deps.push(->1);
    validation_trigger = @observe.apply(null, deps);
  }
  else {
    // simple form; we only depend on our own value
    validation_trigger = field.value;
  }

  
    // validate whenever value changes
  validation_trigger .. @each.track {
    ||
    //console.log("VALIDATING #{field.id}");
    validate_field_iteration(field_node);
  }
}

function validate_field_iteration(field_node) {

  // always asynchronize this, so that we don't do extra work for temporally-contiguous notifications:
  // (for this to be effective, we always need to call validate_field_iteration from @each.track blocks)
  hold(0);

  var field = field_node[ITF_FIELD];
  waitfor {
    var {errors, warnings} = field_node .. run_validators(field.validators, field.validators_deps);
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
  field.validation_state.set({state: state, errors: errors, warnings: warnings});
}


function Field(elem, settings /* || name, initval */) {
  // untangle settings
  if (arguments.length === 2 && typeof settings === 'string') {
    settings = { name: settings };
  }
  else if (arguments.length === 3) {
    settings = { name: settings, initval: arguments[2] }
  }

  settings = {
    name:     undefined,
    initval: undefined,
    Value:    undefined,
    ValidationState: undefined
  } .. @override(settings);

  if (settings.ValidationState)
    settings.ValidationState.set({state:'unknown'});

  var ValidatorsChange = @Emitter();

  return elem ..
    // Mechanism that installs field api:
    @Mechanism(
      function(node) { 
        var field = node[ITF_FIELD] = {
          id: "__oni_field_#{++field_id_counter}",
          
          value: settings.Value || @ObservableVar(settings.initval),
          
          validation_state: settings.ValidationState || @ObservableVar({state:'unknown'}),
          display_validation: @ObservableVar(false),
          addValidator: function(validator) { 
            field.validators.push(validator);
            if (typeof validator === 'object') {
              validator.deps .. @each { |dep| 
                if (field.validators_deps[dep] === undefined)
                  field.validators_deps[dep] = 1;
                else
                  ++field.validators_deps[dep];
              }
            }
            ValidatorsChange.emit();
          },
          removeValidator: function(validator) {
            field.validators .. @remove(validator);
            if (typeof validator === 'object') {
              validator.deps .. @each { |dep|
                if (--field.validators_deps[dep] === 0) 
                  delete field.validators_deps[dep];
              }
            }
            ValidatorsChange.emit();
          },
          validators: [],
          validators_deps: {},
          set_display_validation: (bool) -> field.display_validation.set(bool),
          validation_loop: validate_field_loop,

          _parent_container: node.parentNode .. @getDOMITF(ITF_FIELDCONTAINER)
        };
        
        if (field._parent_container)
          field._parent_container.addField(settings.name, node);
      },
      {
        priority: MECH_PRIORITY_FIELD_API,
        prepend: true
      }
    ) ..  /* end of api injection mechanism */
    // Mechanism that handles synchronization
    @Mechanism(
      function(node) {
        var field_itf = node[ITF_FIELD];

        waitfor {
          // [1] here to make sure that we have an initial prod
          @combine([1],ValidatorsChange) .. @each.track { ||
            field_itf.validation_loop(node);
          }
        }
        and {
          // if our 'display_validation' is turned on, also turn it on for the container's field:
          if (field_itf._parent_container) {
            field_itf.display_validation .. @filter(x->!!x) .. @wait();
            var parent_field = node.parentNode .. @getDOMITF(ITF_FIELD);
            if (parent_field) parent_field.display_validation.set(true);
          }
        }
        finally {
          if (field_itf._parent_container)
            field_itf._parent_container.removeField(settings.name, node);
        }
      },
      {
        priority: MECH_PRIORITY_FIELD_SYNC,
        prepend: true
      }
    ); /* end of synchronization mechanism */
};
exports.Field = Field;
  
/**
   @function FieldMap
   @altsyntax element .. FieldMap()
   @summary Decorate an element as a FieldMap structural container
   @param {../surface::Element} [element]
   @desc
     A [../surface::Element] that is decorated as a FieldMap creates a DOM node 
     implementing the [::ITF_FIELDCONTAINER] interface. The element must **also** be decorated as a [::Field] or
     be enclosed in a [::Field].

     FieldMaps construct a `{name:value}` hash from their contained named [::Field]s and track this value on their 
     attached [::Field]'s Value [sjs:observable::ObservableVar].

     In contrast to [::FieldArray] containers, the mapping from the
     FieldMap's Value to its child fields is **static**: If the
     FieldMap's Value is set to an object containing keys that aren't
     named child fields, then those key-value pairs will be ignored.

   @demo
       @ =  require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'},
       {id:'mho:surface/field', name:'field'}]);

       var demo = @demo.CodeResult("\
       @field.Field() .. 
         @field.FieldMap() ::
           @Div ::
             [
               @field.Field('foo', 'abc') ::
                 @FormGroup ::
                   [
                     @ControlLabel('foo'),
                     @Input()
                   ],
                   
               @field.Field('bar', 'xyz') ::
                 @FormGroup ::
                   [
                     @ControlLabel('bar'),
                     @TextArea()
                   ],

               @field.Field('check', true) :: 
                 @FormGroup .. @Class('checkbox') ::
                   @Label ::
                     [
                       @Checkbox(),
                       ' Check this'
                     ],

               @field.Value() .. @project(@inspect),

               @Button('Set to {foo:\'ABC\', bar:\'XYZ\', check:false, baz:\'123\'}') .. 
                 @OnClick(-> @field.Value().set(
                                        {foo:'ABC', bar:'XYZ', check:false, baz:'123'}))
             ]
       ",
       @field.Field() ..
         @field.FieldMap() ::
           @Div ::
             [
               @field.Field('foo', 'abc') ::
                 @FormGroup ::
                   [
                     @ControlLabel('foo'),
                     @Input()
                   ],
                   
               @field.Field('bar', 'xyz') ::
                 @FormGroup ::
                   [
                     @ControlLabel('bar'),
                     @TextArea()
                   ],

               @field.Field('check', true) :: 
                 @FormGroup .. @Class('checkbox') ::
                   @Label ::
                     [
                       @Checkbox(),
                       ' Check this'
                     ],
               @Br(),

               @field.Value() .. @project(@inspect),

               @Br(),@Br(),
               @Button('Set to {foo:\'ABC\', bar:\'XYZ\', check:false, baz:\'123\'}') .. 
                 @OnClick(-> @field.Value().set(
                                        {foo:'ABC', bar:'XYZ', check:false, baz:'123'}))
             ]
       );
       

       @mainContent .. @appendContent(demo);
*/

// helper:
function aggregateSubfieldValidations(id_and_field_stream) {
  var errors = [], warnings = [];
  id_and_field_stream ..
    @transform.par([key, subfield] -> [key, waitforDecisiveValidationState(subfield[ITF_FIELD])]) ..
    @each {
      |[key, state]|
      if (state.errors.length) {
        errors.push({key:key, errors: state.errors});
      }
      if (state.warnings.length)
        warnings.push({key:key, warnings: state.warnings});
    }
  return {errors: errors, warnings: warnings};
}


var FieldMap = (elem) ->
  elem ..
  // Mechanism that installs field map api:
  @Mechanism(
    function(node) {

      var fieldcontainer_itf = node[ITF_FIELDCONTAINER] = {
        getField: function(name) { return this._fieldmap[name]; },
        addField: function(name, field_node) {
          if (!name) throw new Error("Fields added to FieldMap require a name");
          if (this._fieldmap .. @hasOwn(name)) throw new Error("Multiple instances of field '#{name}' in FieldMap.");
          this._fieldmap[name] = field_node;

          // propagate our initial value to sub field, or vice/versa
          var current_map_value = this._field.value .. @current;
          if (current_map_value .. @hasOwn(name)) 
            field_node[ITF_FIELD].value.set(current_map_value[name]);
          else
            this._field.value.set(current_map_value .. @merge(@pairsToObject([[name, field_node[ITF_FIELD].value .. @current]])));

          // make sure we listen to the new field in our synchronization loop: (only applicable if this field is added dynamically)
          this._field_mutation_emitter.emit();
        },
        removeField: function(name, field_node) {
          if(!this._fieldmap .. @hasOwn(name)) throw new Error("Field '#{name}' not found in FieldMap");
          var entry = this._fieldmap[name];
          delete this._fieldmap[name];
          
          // XXX should we delete the associated value from our _field (or set it to 'undefined')?

          this._field_mutation_emitter.emit();
        },

        // internal fields:

        _fieldmap: {},
        _field_mutation_emitter: @Emitter()
        // _field: our bound field; will be set below
      };

      // override some methods on our containing field.
      // xxx if the containing field is defined on the same dom node,
      // this code requires that the field api is always installed
      // _before_ us. we currently ensure that by setting the
      // 'prepend' flag on the field api install
      // mechanism. alternatively, we could run the code below in
      // another mechanism with priority between
      // MECH_PRIORITY_FIELD_API and MECH_PRIORITY_FIELD_SYNC
      var field_node = node .. @getDOMITFNode(ITF_FIELD);
      if (!field_node) throw new Error("FieldMap must be contained in a Field");
      fieldcontainer_itf._field = field_node[ITF_FIELD];

      // override field.set_display_validation, so that our subfields are also turned on:
      fieldcontainer_itf._field.set_display_validation = @fn.seq(fieldcontainer_itf._field.set_display_validation,
                                             function(bool) {
                                               @ownPropertyPairs(fieldcontainer_itf._fieldmap) ..
                                                 @each {
                                                   |[key, subfield]|
                                                   subfield[ITF_FIELD].set_display_validation(bool)
                                                 }
                                             });
      
      // XXX these two do too much work; we don't need to rerun *all* validators when the child
      // validations change. What we should do is to aggregate child validations separately.
      
      // add validator to the field that aggregates the validation state of our subfields. xxx don't do this as a validator
      fieldcontainer_itf._field.validators.push(-> @ownPropertyPairs(fieldcontainer_itf._fieldmap) .. aggregateSubfieldValidations); 
      
      // override field.validation_loop to trigger on child validation changes:
      fieldcontainer_itf._field.validation_loop = function() {
        // XXX allows deps like in validate_field_loop
        if(fieldcontainer_itf._field.validators_deps .. @ownKeys .. @count > 0) 
          throw new Error("Validator dependencies not implemented for field maps yet"); 
        
        // XXX effectively this does validations twice, because a value change goes 
        // hand in hand with a change in children's validation states
        var args = @ownPropertyPairs(fieldcontainer_itf._fieldmap) .. @map([,subfield] -> subfield[ITF_FIELD].validation_state);
        args.push(fieldcontainer_itf._field.value);
        args.push(->0);
        @observe.apply(null, args) .. @each.track {
          ||
          //console.log("VALIDATING MAP #{fieldcontainer_itf._field.id}");
          validate_field_iteration(field_node);
        }
      };

      if (typeof fieldcontainer_itf._field.value .. @current !== 'object')
        fieldcontainer_itf._field.value.set({});

    },
    {
      priority: MECH_PRIORITY_FIELD_CONTAINER_API
    }      
  ) ..  /* end of api injection mechanism */
  // Mechanism that handles synchronization:
  @Mechanism(
    function(node) {
      var fieldcontainer_itf = node[ITF_FIELDCONTAINER];


      var current_value = fieldcontainer_itf._field.value .. @current;
      
      var CollectNotifications = @Semaphore(1, true);

      waitfor {
        // Keep our associated observable up to date:
        while (1) {
          waitfor {
            var args = @ownPropertyPairs(fieldcontainer_itf._fieldmap) .. @map([,subfield] -> subfield[ITF_FIELD].value);
            
            if (args.length === 0) {
              hold();
            }
            
            args.push(function() {
              // the semaphore here is so that we don't act upon the individual notifications we get when propagating
              // _our_ field value to the subfields
              CollectNotifications.synchronize { ||
                return @zip(@ownKeys(fieldcontainer_itf._fieldmap), arguments) .. @pairsToObject;
              }
            });
            
            @observe.apply(null, args) .. @changes .. @each {
              |x| 
              current_value = current_value .. @merge(x);
              //console.log("SETTING FIELD VALUE OF OBJECT #{fieldcontainer_itf._field.id} TO", current_value);
              
              fieldcontainer_itf._field.value.set(current_value);
            }
          }
          or {
            fieldcontainer_itf._field_mutation_emitter .. @wait;
          }
        }
      }
      and {
        // Propagate changes from our associated observable to our
        // children:
        fieldcontainer_itf._field.value .. @changes .. @each {
          |x| 
          if (x === current_value) continue; 
          CollectNotifications.synchronize { ||
            @ownPropertyPairs(x) .. @each {
              |[key,val]|
              var subfield = fieldcontainer_itf._fieldmap[key];
              if (!subfield) continue;
              subfield[ITF_FIELD].value.set(val);
            }
          }
          // the 'current_value' var will be updated from the 1st branch of the waitfor/and
        }
      }
    },
    {
      priority: MECH_PRIORITY_FIELD_CONTAINER_SYNC
    }
  ); /* end of synchronization mechanism */
exports.FieldMap = FieldMap;


/**
   @function FieldArray
   @altsyntax element .. FieldArray(settings)
   @altsyntax element .. FieldArray(template)
   @summary Decorate an element as a FieldArray structural container
   @param {../surface::Element} [element]
   @param {Object} [settings]
   @setting {Function} [template]
   @setting {optional Function} [arrToVal]
   @setting {optional Function} [valToArr]
   @desc
     A [../surface::Element] that is decorated as a FieldArray creates a DOM node 
     implementing the [::ITF_FIELDCONTAINER] interface. The element must **also** be decorated as a [::Field] or
     be enclosed in a [::Field].

     FieldArrays expect their attached [::Field]'s Value to be an
     array. For each element in this array, a FieldArray creates a DOM
     element using the `template` function and appends it to the
     `element`. Created DOM elements will be created & deleted as
     appropriate to synchronize with changes in the [::Field]'s Value.

     `template` is a function of signature `template(arr_elem_info)`
     that is expected to return a [../surface::Element], which will be
     wrapped with a [::Field] representing the value of the
     corresponding array member.

     `arr_elem_info` is an object containing the following:

         {
           Index:       Observable of the index of this element,
           ArrayLength: FieldArrayLength,
           remove:      function to remove this array element
         }

      `Index` and `ArrayLength` are useful to (dynamically) change the style of the generated
      element if it is the first (`Index .. @current == 0`) or last 
      (`Index .. @current == ArrayLength .. @current -1`) member of the array.

      A call to `remove` removes the corresponding element and updates Value accordingly.

   @demo
       @ =  require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'},
       {id:'mho:surface/field', name:'field'}]);


       var template = {Index, remove} -> 
         @Div([`$Index: `, @Input() .. @Style('width:100px;display:inline;'), ' ', @Button('Remove') .. @OnClick(remove)]);

       var demo = @demo.CodeResult("\
       var template = {Index, remove} -> 
         @Div :: 
           [
             `$Index: `, 
             @Input(),
             @Button('Remove') .. @OnClick(remove)
           ];

       @field.Field({initval:['foo', 'bar', 'baz']}) ::
         @Div() :: 
           [
             @field.FieldArray(template) :: @Div(),

             @Button('Add new') .. 
               @OnClick(-> @field.Value().modify(x->x.concat(['new']))),

             @field.Value() .. @project(@inspect)
           ]
       ",
       @field.Field({initval:['foo', 'bar', 'baz']}) ::
         @Div() :: 
           [
             @Div() .. @field.FieldArray(template), @Br(),
             @Button('Add new') .. @OnClick(-> @field.Value().modify(x->x.concat(['new']))), @Br(), @Br(),
             @field.Value() .. @project(@inspect)
           ]
       );
       

       @mainContent .. @appendContent(demo);
      
*/

function FieldArray(elem, settings) {

  // untangle settings:
  if (typeof settings === 'function') {
    settings = { template: settings };
  }

  return elem ..
    // Mechanism that installs field array api:
    @Mechanism(
      function(node) {
        
        // fieldcontainer for our array items
        var fieldcontainer_itf = node[ITF_FIELDCONTAINER] = {
          getField: function(name) { /* XXX */ },
          addField: function(name, field_node) { 
            // sanity check:
            if (name !== undefined) throw new Error("A FieldArray template must not contain a named Field");
          },
          removeField: function(name, field_node) {
            for (var i=0; i<this._fieldarray.length; ++i) {
              if (this._fieldarray[i].node === field_node) {
                this._fieldarray.splice(i,1);
                this._array_length.modify(x -> --x);
                
                this._array_mutation_emitter.emit();
                return;
              }
            }
            // if we're here, the element has already been removed (from value.set) or we don't know about it
            console.log('warning: array field already removed');
          },

          // internal fields:
          _fieldarray: [],
          _array_mutation_emitter: @Emitter(),
          _array_length: @ObservableVar(0),
          // _field: out bound field; will be set below
        };

        // see notes in equivalent FieldMap code
        var field_node = node .. @getDOMITFNode(ITF_FIELD);
        if (!field_node) throw new Error("FieldArray must be contained in a Field");
        fieldcontainer_itf._field = field_node[ITF_FIELD];

      
        // override field.set_display_validation, so that our subfields are also turned on:
        fieldcontainer_itf._field.set_display_validation = @fn.seq(fieldcontainer_itf._field.set_display_validation,
                                                                   function(bool) {
                                                                     fieldcontainer_itf._fieldarray ..
                                                                       @each {
                                                                         |{node}|
                                                                         node[ITF_FIELD].set_display_validation(bool)
                                                                       }
                                                                   });
      
        // XXX these two do too much work; we don't need to rerun *all* validators when
        // the child validations change. What we should do is to aggregate child validations separately.
      
        // add validator to the field that aggreates the validation state of our subfields. XXX don't do this as a validator
        fieldcontainer_itf._field.validators.push(-> fieldcontainer_itf._fieldarray .. @transform({node} -> node) ..
                                                  @indexed .. aggregateSubfieldValidations);
      
      
        // override field.validation_loop to trigger on child validation changes:
        fieldcontainer_itf._field.validation_loop = function() {
          // XXX allows deps like in validate_field_loop
          if(fieldcontainer_itf._field.validators_deps .. @ownKeys .. @count > 0) 
            throw new Error("Validator dependencies not implemented for field maps yet"); 
        
          @eventStreamToObservable(fieldcontainer_itf._array_mutation_emitter,->0) .. @each.track {
            ||
            // XXX effectively this does validations twice, because a value change goes 
            // hand in hand with a change in children's validation states
            var args = fieldcontainer_itf._fieldarray .. @map(field -> field.node[ITF_FIELD].validation_state);
            args.push(fieldcontainer_itf._field.value);
            args.push(->0);
            @observe.apply(null, args) .. @each.track {
              ||
              //console.log("VALIDATING ARRAY #{fieldcontainer_itf._field.id}");
              validate_field_iteration(field_node);
            }
          }
        };
      },
      {
        priority: MECH_PRIORITY_FIELD_CONTAINER_API
      }
    ) ..  /* end of api injection mechanism */
    // Mechanism that handles synchronization:
    @Mechanism(
      function(node) {
        var fieldcontainer_itf = node[ITF_FIELDCONTAINER];
        var current_value = undefined;
        waitfor {
          // Propagate changes from our associated observable to our
          // children:
          var first = true;
          fieldcontainer_itf._field.value .. @each.track {
            |x|
            
            // make sure an undefined field value gets initialized with []:
            if (first) {
              first = false;
              if (x === undefined) {
                x = [];
                if (settings.arrToVal)
                  x = settings.arrToVal(x);
                fieldcontainer_itf._field.value.set(x);
                continue;
              }
            }
            
            if (x === current_value) continue;
            
            if (settings.valToArr)
              x = settings.valToArr(x);
          
            var array_mutation = false;
          
            fieldcontainer_itf._array_length.modify(l -> x.length);
            x .. @indexed .. @each { |[i,val]|
              if (!fieldcontainer_itf._fieldarray[i]) { 
                array_mutation = true;
                var Index = @ObservableVar(i);
                var inserted = (node .. 
                                @appendContent(settings.template(
                                  {
                                    Index:       Index,
                                    ArrayLength: fieldcontainer_itf._array_length,
                                    remove:      function() {
                                      var i = Index .. @current;
                                      var field = fieldcontainer_itf._fieldarray.splice(i, 1)[0];
                                      field.node .. @removeNode();
                                      for (/**/;i<fieldcontainer_itf._fieldarray.length;++i)
                                        fieldcontainer_itf._fieldarray[i].Index.modify(l-> --l);
                                      fieldcontainer_itf._array_length.modify(l-> --l);
                                      fieldcontainer_itf._array_mutation_emitter.emit();
                                    }
                                  }) ..
                                               Field()));
                fieldcontainer_itf._fieldarray[i] = {node: inserted[0], Index: Index};
              }
              fieldcontainer_itf._fieldarray[i].node[ITF_FIELD].value.set(val);
            }
            while ( fieldcontainer_itf._fieldarray.length > x.length) {
              array_mutation = true;
              fieldcontainer_itf._fieldarray.pop().node .. @removeNode();
            }
            if (array_mutation) fieldcontainer_itf._array_mutation_emitter.emit();
          };
        }
        and {
          // Keep our associated observable up to date:
          while (1) {
            waitfor {
              if (!fieldcontainer_itf._fieldarray.length) { 
                if (current_value !== undefined) {
                  var x = [];
                  if (settings.arrToVal)
                    x = settings.arrToVal(x);
                  fieldcontainer_itf._field.value.set(x);
                }
                hold(); 
              }
              var args = fieldcontainer_itf._fieldarray .. @map(field -> field.node[ITF_FIELD].value);
              // XXX the hold(0) here was inserted to prevent individual
              // notifications when setting several fields in a temporally
              // contiguous block (e.g. when setting our outer field value).
              // This seems to be uncommon, and performance is better if we don't have the hold(0) here, but 
              // if need be, we could add a semaphore to coordinate between outer and inner updates - see 
              // FieldMap.
              args.push(-> (/*hold(0),*/arguments .. @toArray));
              @observe.apply(null, args) .. @each {
                |x|
                
                if (settings.arrToVal)
                  x = settings.arrToVal(x);
                
                current_value = x;
                //console.log("SETTING FIELD VALUE OF ARRAY #{field.id} TO", current_value);
                fieldcontainer_itf._field.value.set(current_value);
              }
            }
            or {
              fieldcontainer_itf._array_mutation_emitter .. @wait;
            } 
          }
        }
      },
      {
        priority: MECH_PRIORITY_FIELD_CONTAINER_SYNC
      }
    ); /* end of synchronization mechanism */
};

exports.FieldArray = FieldArray;


/**
   @function Validate
   @summary Add a validator to the enclosing [::Field]
   @param {mho:surface::Element} [element] Element to attach validator to
   @param {Function} [validator] Validator function; see description
   @desc
     `validator` is a function that will be called whenever the enclosing [::Field] 
     is being validated (either explicitly, through a call to [::validate] or 
     implicitly when a form element - such as an [mho:surface/html::Input]) - bound to
     the field receives user input).

     `validator` will be passed the [::Field]'s current value.
     It is expected to return either `true` (signifying that the value is valid),
     `false` (signifying that the value is invalid for an unspecified reason),
     or a "validation object".

     A "validation object" has one of the following structures:


     * simple form

           {
             error:    description of error (object or string),
             warning:  description of warning (object or string)
           }

     Both `error` and `warning` are optional. Omission of `error`
     and/or `warning` signifies that the validator yieled no error
     and/or warning.


     * aggregate form

           {
             errors:   [ array of error objects/strings  ],
             warnings: [ array of warning objects/strings ]
           }

     Empty `errors` and/or `warnings` arrays signify that the validator yielded
     no errors and/or warnings.

     ### Example

     See [::Field] for an example.
*/

var Validate = function(elem, validator) {

  if (typeof validator === 'object') {
      if (!Array.isArray(validator.deps)) throw new Error("field::Validate: 'deps' array expected in #{validator .. @inspect}");
      if (typeof validator.validate !== 'function') throw new Error("field::Validate: 'validate' function expected in #{validator .. @inspect}");
  }
  else if (typeof validator !== 'function')
    throw new Error("field::Validate: invalid validator argument");
  
  return elem ..
    @Mechanism(function(node) {
      var field = node .. @getDOMITF(ITF_FIELD);
      if (!field) throw new Error("'Validate' decorator outside of a Field");
      field.addValidator(validator);
      try {
        hold();
      }
      finally {
        field.removeValidator(validator);
      }
    });
};
exports.Validate = Validate;
