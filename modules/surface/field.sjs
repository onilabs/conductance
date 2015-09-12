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
  {id:'./base', include: ['Mechanism']},
  {id:'./dynamic', include: ['appendContent', 'removeNode', 'findNodeWithContext', 'findContext']},
  {id:'sjs:type', include: ['Interface']}
]);


//----------------------------------------------------------------------
// Interfaces:

/**
   @variable CTX_FIELD
   @summary An [sjs:type::Interface] implemented by [::Field] DOM objects.
   @desc
     A DOM object `obj` implementing CTX_FIELD promises to have 
     the following interface defined:
   
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

     CTX_FIELD is an internal implementation detail that might
     change in future. Client code should never call the functions listed
     above directly, but instead use the API function in the [./field::] 
     module.
*/
var CTX_FIELD = exports.CTX_FIELD = @Interface(module, "ctx_field");


/**
   @variable CTX_FIELDCONTAINER
   @summary An [sjs:type::Interface] implemented by [::FieldArray] and [::FieldMap] DOM objects. 
   @desc     
       A DOM object `obj` implementing CTX_FIELDCONTAINER promises to have 
       the following interface defined:
       
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
   @altsyntax node .. fieldValue
   @summary Return the 'Value' [sjs:observable::ObservableVar] for a field
   @param {DOMNode} [node] DOM node with attached [::Field] or a child thereof
   @demo
       @ =  require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'},
       {id:'mho:surface/field', name:'field'}]);

       var demo = @demo.CodeResult("\
         @field.Field() ::
           [
             @Input(),
             @ContentGenerator(
               (append, node) ->
                 append(`<br>The value is: '${node .. @field.fieldValue}'<br>`)
             ),
             @Button('Capitalize') .. 
               @OnClick({target} -> (target .. @field.fieldValue).modify(x->x.toUpperCase())),
           ]
       ",
         @field.Field({initval:'foo'}) ::
           [
             @Input(),
             @ContentGenerator(
               (append, node) ->
                 append(`<br>The value is: '${node .. @field.fieldValue}'<br>`)
             ),
             @Button("Capitalize") .. @OnClick({target}-> (target .. @field.fieldValue).modify(x->x.toUpperCase())),
           ]
       );
       

       @mainContent .. @appendContent(demo);
     
*/
function fieldValue(node) {
  var ctx = node .. @findContext(CTX_FIELD);
  if (!ctx) throw new Error("fieldValue: node #{node} is not part of a Field");
  return ctx.value;
}
exports.fieldValue = fieldValue;

/**
   @function validate
   @altsyntax node .. validate
   @summary Run all [::Validate] functions attached to a [::Field]
   @param {DOMNode} [node] DOM node with attached [::Field] or a child thereof

*/
function validate(node) {
  var ctx = node .. @findContext(CTX_FIELD);
  if (!ctx) throw new Error("validate: node #{node} is not part of a Field");
  return ctx.validate();
}
exports.validate = validate;

/**
   @function validationState
   @altsyntax node .. validationState
   @summary Return the validation state [sjs:observable::Observable] for a field
   @param {DOMNode} [node] DOM node with attached [::Field] or a child thereof
   @desc
     See [::Field] for an example.
*/
function validationState(node) {
  var ctx = node .. @findContext(CTX_FIELD);
  if (!ctx) throw new Error("validationState: node #{node} is not part of a Field");
  return ctx.validation_state;
}
exports.validationState = validationState;

/**
   @function getField
   @summary Find a DOM node bound to a Field 
   @param {DOMNode} [node] DOM node at which to start searching
   @param {optional String} [path] Path for traversing a field container hierarchy
   @desc
     If `path` is undefined, `getField` returns the closest parent that has a [::Field] attached.

     If specified, `path` identifies a particular field in a [::FieldMap] hierarchy. It is a string of Field names, '.' and
     '..' separated by slashes.

     ### Path examples:

     - `'./foo'`, `'/foo'` and `'foo'` all locate the Field named 'foo' located in the nearest enclosing
     FieldMap to `node`.

     - `'foo/bar'` locates the field named 'bar' in the Field named 'foo' which is also expected to be a FieldMap and which in turn is contained in the same FieldMap as `node`.

     - `'../foo'` locates the field named 'foo' in the FieldMap that contains the FieldMap in which `node` is located.
*/
function getField(node, path) {
  
  // XXX is this a good idea? Always asynchronize so that 'getField'
  // works from ancestor mechanisms:
  hold(0);
  
  node = node .. @findNodeWithContext(CTX_FIELD);
  if (path && path.length) {
    if (!node[CTX_FIELDCONTAINER])
      node = node .. @findNodeWithContext(CTX_FIELDCONTAINER);
    
    path.split('/') .. @each { 
      |component|
      if (component === '.') {
        // nothing to be done
      }
      else if (component === '..') {
        node = node.parentNode .. @findNodeWithContext(CTX_FIELDCONTAINER);
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
     implementing the [::CTX_FIELD] interface.
     
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
     also accessible as an [sjs:observable::Observable] via the [::validationState] function.  

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
                   
                 @ContentGenerator(
                   (append, node) ->
                     append(node .. @field.validationState .. @project(@inspect))
                 )
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
                   
                 @ContentGenerator(
                   (append, node) ->
                     append(node .. @field.validationState .. @project(@inspect))
                 )
               ]
       );
       

       @mainContent .. @appendContent(demo);
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

  return elem ..
    @Mechanism(function(node) {

      var field = node[CTX_FIELD] = {
        id: "__oni_field_#{++field_id_counter}",
        
        value: settings.Value || @ObservableVar(settings.initval),
        
        validation_state: settings.ValidationState || @ObservableVar({state:'unknown'}),
        auto_validate: @ObservableVar(false),
        validators: [],
        validators_deps: {},
        validate: validate_field
      };

      var parent_container = node.parentNode .. @findContext(CTX_FIELDCONTAINER);
      
      try {
        if (parent_container)
          parent_container.addField(settings.name, node);
        
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
          parent_container.removeField(settings.name, node);
      }
    }, true /* we PREPEND this mechanism, so that Mechanisms that search for a Field interface (like ContextualInputMechanism) works correctly, even when the Field interface and the Mechanism depending on the Field are on the same element */);
};
exports.Field = Field;
  
/**
   @function FieldMap
   @altsyntax element .. FieldMap()
   @summary Decorate an element as a FieldMap structural container
   @param {../surface::Element} [element]
   @desc
     A [../surface::Element] that is decorated as a FieldMap creates a DOM node 
     implementing the [::CTX_FIELDCONTAINER] interface. The element must **also** be decorated as a [::Field] or
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

               @ContentGenerator(
                 (append, node) ->
                   append(node .. @field.fieldValue .. @project(@inspect))
               ),

               @Button('Set to {foo:\'ABC\', bar:\'XYZ\', check:false, baz:\'123\'}') .. 
                 @OnClick({target} -> (target .. @field.fieldValue).set(
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

               @ContentGenerator(
                 (append, node) ->
                   append(node .. @field.fieldValue .. @project(@inspect))
               ),
               @Br(),@Br(),
               @Button('Set to {foo:\'ABC\', bar:\'XYZ\', check:false, baz:\'123\'}') .. 
                 @OnClick({target} -> (target .. @field.fieldValue).set(
                                        {foo:'ABC', bar:'XYZ', check:false, baz:'123'}))
             ]
       );
       

       @mainContent .. @appendContent(demo);
*/

var FieldMap = (elem) ->
  elem ..
  @Mechanism(function(node) {

    var field = node .. @findContext(CTX_FIELD);
    if (!field) throw new Error("FieldMap must be contained in a Field");
    // XXX maybe instantiate a field on us if there isn't one?

    var fieldmap = {};
    var field_mutation_emitter = @Emitter();
        
    node[CTX_FIELDCONTAINER] = {
      getField: function(name) { return fieldmap[name]; },
      addField: function(name, field_node) {
        if (!name) throw new Error("Fields added to FieldMap require a name");
        if (fieldmap .. @hasOwn(name)) throw new Error("Multiple instances of field '#{name}' in FieldMap.");
        fieldmap[name] = field_node;
        field_mutation_emitter.emit();
      },
      removeField: function(name, field_node) {
        if(!fieldmap .. @hasOwn(name)) throw new Error("Field '#{name}' not found in FieldMap");
        var entry = fieldmap[name];
        delete fieldmap[name];
        field_mutation_emitter.emit();
      }
    };

    // give children a chance to register (with addField) before we
    // run our synchronization loop below:
    hold(0);

    var current_value = undefined;

    waitfor {
      // Keep our associated observable up to date:
      while (1) {
        waitfor {
          var args = @ownPropertyPairs(fieldmap) .. @map([,subfield] -> subfield[CTX_FIELD].value);
          
          if (args.length === 0) {
            current_value = {};
            field.value.set(current_value);
            hold();
          }
          
          // the hold(0) is necessary so that we don't get individual notifications when setting several 
          // subfields in a temporally contiguous block
          args.push(-> (hold(0),@zip(@ownKeys(fieldmap), arguments) .. @pairsToObject));
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
        @ownPropertyPairs(x) .. @each {
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
        @ownPropertyPairs(fieldmap) .. 
          @transform.par([key,subfield] -> [key, subfield[CTX_FIELD].validate()]) .. @each {
            |[key,state]|
            if (state.errors.length)
              errors.push({key:key, errors: state.errors});
            if (state.warnings.length)
              warnings.push({key:key, warnings: state.warnings});
          }
        return {errors: errors, warnings: warnings};
      });
      // XXX this doesn't work: field.auto_validate.set(true);

      // XXX could remove validator in finally clause
    }
  });
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
     A [../surface::Element] that is decorated as a FieldMap creates a DOM node 
     implementing the [::CTX_FIELDCONTAINER] interface. The element must **also** be decorated as a [::Field] or
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
               @OnClick({target} -> 
                 (target .. @field.fieldValue()).modify(x->x.concat(['new']))),

             @ContentGenerator(
               (append, node) ->
                 append(node .. @field.fieldValue() .. @project(@inspect))
             )
           ]
       ",
       @field.Field({initval:['foo', 'bar', 'baz']}) ::
         @Div() :: 
           [
             @Div() .. @field.FieldArray(template), @Br(),
             @Button('Add new') .. @OnClick({target} -> (target .. @field.fieldValue()).modify(x->x.concat(['new']))), @Br(), @Br(),
             @ContentGenerator(
               (append, node) ->
                 append(node .. @field.fieldValue() .. @project(@inspect))
             )
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
    @Mechanism(function(node) {

    var field = node .. @findContext(CTX_FIELD);
    if (!field) throw new Error("FieldArray must be contained in a Field");
    // XXX maybe instantiate a field on us if there isn't one?

    var fieldarray = [];
    var FieldArrayLength = @ObservableVar(0);
    var array_mutation_emitter = @Emitter();
        
    // fieldcontainer for our array items
    node[CTX_FIELDCONTAINER] = {
      getField: function(name) { /* XXX */ },
      addField: function(name, field_node) { 
        // sanity check:
        if (name !== undefined) throw new Error("A FieldArray template must not contain a named Field");
      },
      removeField: function(name, field_node) {
        for (var i=0; i<fieldarray.length; ++i) {
          if (fieldarray[i].node === field_node) {
            fieldarray.splice(i,1);
            FieldArrayLength.modify(x -> --x);

            array_mutation_emitter.emit();
            return;
          }
        }
        // if we're here, the element has already been removed (from value.set) or we don't know about it
        console.log('warning: array field already removed');
      }
    };
    
    var current_value = undefined;
    waitfor {
      // Propagate changes from our associated observable to our
      // children:
      var first = true;
      field.value .. @each.track {
        |x|
        
        // make sure an undefined field value gets initialized with []:
        if (first) {
          first = false;
          if (x === undefined) {
            x = [];
            if (settings.arrToVal)
              x = settings.arrToVal(x);
            field.value.set(x);
            continue;
          }
        }

        if (x === current_value) continue;

        if (settings.valToArr)
          x = settings.valToArr(x);

        var array_mutation = false;

        FieldArrayLength.modify(l -> x.length);
        x .. @indexed .. @each { |[i,val]|
          if (!fieldarray[i]) { 
            array_mutation = true;
            var Index = @ObservableVar(i);
            var inserted = (node .. 
                            @appendContent(settings.template(
                              {
                                Index:       Index,
                                ArrayLength: FieldArrayLength,
                                remove:      function() {
                                  var i = Index .. @current;
                                  var field = fieldarray.splice(i, 1)[0];
                                  field.node .. @removeNode();
                                  for (/**/;i<fieldarray.length;++i)
                                    fieldarray[i].Index.modify(l-> --l);
                                  FieldArrayLength.modify(l-> --l);
                                  array_mutation_emitter.emit();
                                }
                              }) ..
                                           Field()));
            fieldarray[i] = {node: inserted[0], Index: Index};
          }
          fieldarray[i].node[CTX_FIELD].value.set(val);
        }
        while ( fieldarray.length > x.length) {
          array_mutation = true;
          fieldarray.pop().node .. @removeNode();
        }
        if (array_mutation) array_mutation_emitter.emit();
      };
    }
    and {
      // Keep our associated observable up to date:
      while (1) {
        waitfor {
          if (!fieldarray.length) { 
            if (current_value !== undefined) {
              var x = [];
              if (settings.arrToVal)
                x = settings.arrToVal(x);
              field.value.set(x);
            }
            hold(); 
          }
          var args = fieldarray .. @map(field -> field.node[CTX_FIELD].value);
          // the hold(0) is necessary so that we don't get individual
          // notifications when setting several fields in a temporally
          // contiguous block
          args.push(-> (hold(0),arguments .. @toArray));
          @observe.apply(null, args) .. @each {
            |x|
            
            if (settings.arrToVal)
              x = settings.arrToVal(x);

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
      // add validator to the field:
      field.validators.push(function() {
        var errors = [], warnings = [];
        fieldarray .. @indexed .. 
          @transform.par([key, subfield] -> [key, subfield.node[CTX_FIELD].validate()]) .. 
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

var Validate = (elem, validator) ->
  elem ..
  @Mechanism(function(node) {
    var field = node .. @findContext(CTX_FIELD);
    if (!field) throw new Error("'Validate' decorator outside of a Field");
    field.validators.push(validator);
    if (validator .. @isArrayLike) {
      validator[0] .. @each { |dep| field.validators_deps[dep] = true }
    }
    // XXX could remove validator in finally clause
  });
exports.Validate = Validate;
