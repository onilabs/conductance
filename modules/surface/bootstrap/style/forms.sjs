var { scope, scale, darken, add, lighten } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* GENERAL STYLES */
/* -------------- */

/* Make all forms have space below them */
form {
  margin: 0 0 #{vars.baseLineHeight()};
}

fieldset {
  padding: 0;
  margin: 0;
  border: 0;
}

/* Groups of fields with labels on top (legends) */
legend {
  display: block;
  width: 100%;
  padding: 0;
  margin-bottom: #{vars.baseLineHeight()};
  font-size: #{scale(vars.baseFontSize(), 1.5)};
  line-height: #{scale(vars.baseLineHeight(), 2)};
  color: #{vars.grayDark()};
  border: 0;
  border-bottom: 1px solid #e5e5e5;

}
  /* Small */
legend small {
    font-size: #{scale(vars.baseLineHeight(), .75)};
    color: #{vars.grayLight()};
}

/* Set font for forms */
label,
input,
button,
select,
textarea {
  #{mixins.font.shorthand(vars.baseFontSize(),'normal',vars.baseLineHeight())} /* Set size, weight, line-height here */
}
input,
button,
select,
textarea {
  font-family: #{vars.baseFontFamily()}; /* And only set font-family here for those that need it (note the missing label element) */
}

/* Identify controls by their labels */
label {
  display: block;
  margin-bottom: 5px;
}

/* Form controls */
/* ------------------------- */

/* Shared size and type resets */
select,
textarea,
input[type='text'],
input[type='password'],
input[type='datetime'],
input[type='datetime-local'],
input[type='date'],
input[type='month'],
input[type='time'],
input[type='week'],
input[type='number'],
input[type='email'],
input[type='url'],
input[type='search'],
input[type='tel'],
input[type='color'],
.uneditable-input {
  display: inline-block;
  height: #{vars.baseLineHeight()};
  padding: 4px 6px;
  margin-bottom: #{vars.baseLineHeight() .. scale(1/2)};
  font-size: #{vars.baseFontSize()};
  line-height: #{vars.baseLineHeight()};
  color: #{vars.gray()};
  #{mixins.border_radius(vars.inputBorderRadius())}
  vertical-align: middle;
}

/* Reset appearance properties for textual inputs and textarea */
/* Declare width for legacy (can't be on input[type=*] selectors or it's too specific) */
input,
textarea,
.uneditable-input {
  width: 206px; // plus 12px padding and 2px border
}
/* Reset height since textareas have rows */
textarea {
  height: auto;
}
/* Everything else */
textarea,
input[type='text'],
input[type='password'],
input[type='datetime'],
input[type='datetime-local'],
input[type='date'],
input[type='month'],
input[type='time'],
input[type='week'],
input[type='number'],
input[type='email'],
input[type='url'],
input[type='search'],
input[type='tel'],
input[type='color'],
.uneditable-input {
  background-color: #{vars.inputBackground()};
  border: 1px solid #{vars.inputBorder()};
  #{mixins.box_shadow('inset 0 1px 1px rgba(0,0,0,.075)')}
  #{mixins.transition('border linear .2s, box-shadow linear .2s')}
}

  /* Focus state */
textarea:focus,
input[type='text']:focus,
input[type='password']:focus,
input[type='datetime']:focus,
input[type='datetime-local']:focus,
input[type='date']:focus,
input[type='month']:focus,
input[type='time']:focus,
input[type='week']:focus,
input[type='number']:focus,
input[type='email']:focus,
input[type='url']:focus,
input[type='search']:focus,
input[type='tel']:focus,
input[type='color']:focus,
.uneditable-input:focus {
    border-color: rgba(82,168,236,.8);
    outline: 0;
    outline: thin dotted \\9; /* IE6-9 */
    #{mixins.box_shadow('inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(82,168,236,.6)')}
}


/* Position radios and checkboxes better */
input[type='radio'],
input[type='checkbox'] {
  margin: 4px 0 0;
  *margin-top: 0; /* IE7 */
  margin-top: 1px \\9; /* IE8-9 */
  line-height: normal;
}

/* Reset width of input images, buttons, radios, checkboxes */
input[type='file'],
input[type='image'],
input[type='submit'],
input[type='reset'],
input[type='button'],
input[type='radio'],
input[type='checkbox'] {
  width: auto; /* Override of generic input selector */
}

/* Set the height of select and file controls to match text inputs */
select,
input[type='file'] {
  height: #{vars.inputHeight()}; /* In IE7, the height of the select element cannot be changed by height, only font-size */
  *margin-top: 4px; /* For IE7, add top margin to align select with labels */
  line-height: #{vars.inputHeight()};
}

/* Make select elements obey height by applying a border */
select {
  width: 220px; /* default input width + 10px of padding that doesn't get applied */
  border: 1px solid #{vars.inputBorder()};
  background-color: #{vars.inputBackground()}; /* Chrome on Linux and Mobile Safari need background-color */
}

/* Make multiple select elements height not fixed */
select[multiple],
select[size] {
  height: auto;
}

/* Focus for select, file, radio, and checkbox */
select:focus,
input[type='file']:focus,
input[type='radio']:focus,
input[type='checkbox']:focus {
  #{mixins.tab_focus()}
}

/* Uneditable inputs */
/* ------------------------- */

/* Make uneditable inputs look inactive */
.uneditable-input,
.uneditable-textarea {
  color: #{vars.grayLight()};
  background-color: #{darken(vars.inputBackground(), 0.01)};
  border-color: #{vars.inputBorder()};
  #{mixins.box_shadow('inset 0 1px 2px rgba(0,0,0,.025)')}
  cursor: not-allowed;
}

/* For text that needs to appear as an input but should not be an input */
.uneditable-input {
  overflow: hidden; /* prevent text from wrapping, but still cut it off like an input does */
  white-space: nowrap;
}

/* Make uneditable textareas behave like a textarea */
.uneditable-textarea {
  width: auto;
  height: auto;
}

/* Placeholder */
/* ----------------- */

/* Placeholder text gets special styles because when browsers invalidate entire lines if it doesn't understand a selector */

#{mixins.placeholder('input')}
#{mixins.placeholder('textarea')}



/* CHECKBOXES & RADIOS */
/* ------------------- */

/* Indent the labels to position radios/checkboxes as hanging */
.radio,
.checkbox {
  min-height: #{vars.baseLineHeight()}; /* clear the floating input if there is no label text */
  padding-left: 20px;
}
.radio input[type='radio'],
.checkbox input[type='checkbox'] {
  float: left;
  margin-left: -20px;
}

/* Move the options list down to align with labels */
.controls > .radio:first-child,
.controls > .checkbox:first-child {
  padding-top: 5px; /* has to be padding because margin collaspes */
}

/* Radios and checkboxes on same line */
/* TODO v3: Convert .inline to .control-inline */
.radio.inline,
.checkbox.inline {
  display: inline-block;
  padding-top: 5px;
  margin-bottom: 0;
  vertical-align: middle;
}
.radio.inline + .radio.inline,
.checkbox.inline + .checkbox.inline {
  margin-left: 10px; /* space out consecutive inline controls */
}



/* INPUT SIZES */
/* ----------- */

/* General classes for quick sizes */
.input-mini       { width: 60px; }
.input-small      { width: 90px; }
.input-medium     { width: 150px; }
.input-large      { width: 210px; }
.input-xlarge     { width: 270px; }
.input-xxlarge    { width: 530px; }

/* Grid style input sizes */
input[class*='span'],
select[class*='span'],
textarea[class*='span'],
.uneditable-input[class*='span'],
/* Redeclare since the fluid row class is more specific */
.row-fluid input[class*='span'],
.row-fluid select[class*='span'],
.row-fluid textarea[class*='span'],
.row-fluid .uneditable-input[class*='span'] {
  float: none;
  margin-left: 0;
}
/* Ensure input-prepend/append never wraps */
.input-append input[class*='span'],
.input-append .uneditable-input[class*='span'],
.input-prepend input[class*='span'],
.input-prepend .uneditable-input[class*='span'],
.row-fluid input[class*='span'],
.row-fluid select[class*='span'],
.row-fluid textarea[class*='span'],
.row-fluid .uneditable-input[class*='span'],
.row-fluid .input-prepend [class*='span'],
.row-fluid .input-append [class*='span'] {
  display: inline-block;
}



/* GRID SIZING FOR INPUTS */
/* ---------------------- */

#{mixins.grid.input(vars.gridColumnWidth(), vars.gridGutterWidth())}
#{mixins.clearfix('.controls-row')}

/* Float to collapse white-space for proper grid alignment */
.controls-row [class*='span'],
/* Redeclare the fluid grid collapse since we undo the float for inputs */
.row-fluid .controls-row [class*='span'] {
  float: left;
}
/* Explicity set top padding on all checkboxes/radios, not just first-child */
.controls-row .checkbox[class*='span'],
.controls-row .radio[class*='span'] {
  padding-top: 5px;
}


/* DISABLED STATE */
/* -------------- */

/* Disabled and read-only inputs */
input[disabled],
select[disabled],
textarea[disabled],
input[readonly],
select[readonly],
textarea[readonly] {
  cursor: not-allowed;
  background-color: #{vars.inputDisabledBackground()};
}
/* Explicitly reset the colors here */
input[type='radio'][disabled],
input[type='checkbox'][disabled],
input[type='radio'][readonly],
input[type='checkbox'][readonly] {
  background-color: transparent;
}




/* FORM FIELD FEEDBACK STATES */
/* -------------------------- */

/* Warning */
#{mixins.formFieldState('.control-group.warning', vars.warningText(), 
                        vars.warningText(), vars.warningBackground())}

/* Error */
#{mixins.formFieldState('.control-group.error', vars.errorText(), 
                        vars.errorText(), vars.errorBackground())}

/* Success */
#{mixins.formFieldState('.control-group.success', vars.successText(), 
                        vars.successText(), vars.successBackground())}
/* Info */
#{mixins.formFieldState('.control-group.info', vars.infoText(), 
                        vars.infoText(), vars.infoBackground())}

/* HTML5 invalid states */
/* Shares styles with the .control-group.error above */
input:focus:invalid,
textarea:focus:invalid,
select:focus:invalid {
  color: #b94a48;
  border-color: #ee5f5b;
}
input:focus:invalid:focus,
textarea:focus:invalid:focus,
select:focus:invalid:focus {
    border-color: #{darken('#ee5f5b', .1)};
    #{mixins.box_shadow('0 0 6px '+lighten('#ee5f5b', .2))}
}



/* FORM ACTIONS */
/* ------------ */

.form-actions {
  padding: #{add(vars.baseLineHeight(), -1)} 20px #{vars.baseLineHeight()};
  margin-top: #{vars.baseLineHeight()};
  margin-bottom: #{vars.baseLineHeight()};
  background-color: #{vars.formActionsBackground()};
  border-top: 1px solid #e5e5e5;
}
#{mixins.clearfix('.form-actions')} /* Adding clearfix to allow for .pull-right button containers */



/* HELP TEXT */
/* --------- */

.help-block,
.help-inline {
  color: #{vars.textColor() .. lighten(.15)}; /* lighten the text some for contrast */
}

.help-block {
  display: block; /* account for any element using help-block */
  margin-bottom: #{scale(vars.baseLineHeight(), 1/2)};
}

.help-inline {
  display: inline-block;
  #{mixins.ie7_inline_block()}
  vertical-align: middle;
  padding-left: 5px;
}



/* INPUT GROUPS */
/* ------------ */

/* Allow us to put symbols and text within the input field for a cleaner look */
.input-prepend,
.input-append {
  display: inline-block;
  margin-bottom: #{vars.baseLineHeight() .. scale(1/2)};
  vertical-align: middle;
  font-size: 0; /* white space collapse hack */
  white-space: nowrap; /* Prevent span and input from separating */
}

.input-prepend input,
.input-prepend select,
.input-prepend .uneditable-input,
.input-prepend .dropdown-menu,
.input-prepend .popover,
.input-append input,
.input-append select,
.input-append .uneditable-input 
.input-append .dropdown-menu,
.input-append .popover {
  font-size: #{vars.baseFontSize()};
}

.input-prepend input,
.input-prepend select,
.input-prepend .uneditable-input,
.input-append input,
.input-append select,
.input-append .uneditable-input {
    position: relative; /* placed here by default so that on :focus we can place the input above the .add-on for full border and box-shadow goodness */
    margin-bottom: 0; /* prevent bottom margin from screwing up alignment in stacked forms */
    *margin-left: 0;
    vertical-align: top;
    #{mixins.border_radius('0 '+vars.inputBorderRadius()+' '+vars.inputBorderRadius()+' 0') }
}

/* Make input on top when focused so blue border and shadow always show */
.input-prepend input:focus,
.input-prepend select:focus,
.input-prepend .uneditable-input:focus,
.input-append input:focus,
.input-append select:focus,
.input-append .uneditable-input:focus {
      z-index: 2;
}

.input-prepend .add-on,
.input-append .add-on {
    display: inline-block;
    width: auto;
    height: #{vars.baseLineHeight()};
    min-width: 16px;
    padding: 4px 5px;
    font-size: #{vars.baseFontSize()};
    font-weight: normal;
    line-height: #{vars.baseLineHeight()};
    text-align: center;
    text-shadow: 0 1px 0 #{vars.white()};
    background-color: #{vars.grayLighter()};
    border: 1px solid #ccc;
}

.input-prepend .add-on,
.input-append .add-on,
.input-prepend .btn,
.input-append .btn,
.input-prepend .btn-group > .dropdown-toggle,
.input-append .btn-group > .dropdown-toggle {
    vertical-align: top;
    #{mixins.border_radius('0')}
}
.input-prepend .active,
.input-append .active {
    background-color: #{lighten(vars.green(), .3)};
    border-color: #{vars.green()};
}

.input-prepend .add-on,
.input-prepend .btn {
    margin-right: -1px;
}
.input-prepend .add-on:first-child,
.input-prepend .btn:first-child {
    /* FYI, `.btn:first-child` accounts for a button group that's prepended */
    #{mixins.border_radius(vars.inputBorderRadius()+' 0 0 '+vars.inputBorderRadius())}
}

.input-append input,
.input-append select,
.input-append .uneditable-input {
    #{mixins.border_radius(vars.inputBorderRadius()+' 0 0 '+vars.inputBorderRadius())}
}
.input-append input + .btn-group .btn:last-child,
.input-append select + .btn-group .btn:last-child,
.input-append .uneditable-input + .btn-group .btn:last-child {
    #{mixins.border_radius('0 '+vars.inputBorderRadius()+' '+vars.inputBorderRadius()+' 0')}
}
.input-append .add-on,
.input-append .btn,
.input-append .btn-group {
    margin-left: -1px;
}

.input-append .add-on:last-child,
.input-append .btn:last-child,
.input-append .btn-group:last-child > .dropdown-toggle /* XXX need Oni Labs edit: dropdowns aren't last-child, because of the <ul> */ { 
    #{mixins.border_radius('0 '+vars.inputBorderRadius()+' '+vars.inputBorderRadius()+' 0')}
}

/* Remove all border-radius for inputs with both prepend and append */
.input-prepend.input-append input,
.input-prepend.input-append select,
.input-prepend.input-append .uneditable-input {
    #{mixins.border_radius('0')}
}
.input-prepend.input-append input + .btn-group .btn,
.input-prepend.input-append select + .btn-group .btn,
.input-prepend.input-append .uneditable-input + .btn-group .btn {
    #{mixins.border_radius('0 '+vars.inputBorderRadius()+' '+vars.inputBorderRadius()+' 0')}
}

.input-prepend.input-append .add-on:first-child,
.input-prepend.input-append .btn:first-child {
    margin-right: -1px;
    #{mixins.border_radius(vars.inputBorderRadius()+' 0 0 '+vars.inputBorderRadius())}
}
.input-prepend.input-append .add-on:last-child,
.input-prepend.input-append .btn:last-child {
    margin-left: -1px;
    #{mixins.border_radius('0 '+vars.inputBorderRadius()+' '+vars.inputBorderRadius()+' 0')}
}
.input-prepend.input-append .btn-group:first-child {
    margin-left: 0;
}

/* SEARCH FORM */
/* ----------- */

input.search-query {
  padding-right: 14px;
  padding-right: 4px \\9;
  padding-left: 14px;
  padding-left: 4px \\9; /* IE7-8 doesn't have border-radius, so don't indent the padding */
  margin-bottom: 0; /* remove the default margin on all inputs */
  #{mixins.border_radius('15px')}
}

/* Allow for input prepend/append in search forms */
.form-search .input-append .search-query,
.form-search .input-prepend .search-query {
  #{mixins.border_radius('0')} /* Override due to specificity */
}
.form-search .input-append .search-query {
  #{mixins.border_radius('14px 0 0 14px')}
}
.form-search .input-append .btn {
  #{mixins.border_radius('0 14px 14px 0')}
}
.form-search .input-prepend .search-query {
  #{mixins.border_radius('0 14px 14px 0')}
}
.form-search .input-prepend .btn {
  #{mixins.border_radius('14px 0 0 14px')}
}


/* HORIZONTAL & VERTICAL FORMS */
/* --------------------------- */

/* Common properties */
/* ----------------- */

.form-search input,
.form-search textarea,
.form-search select,
.form-search .help-inline,
.form-search .uneditable-input,
.form-search .input-prepend,
.form-search .input-append,
.form-inline input,
.form-inline textarea,
.form-inline select,
.form-inline .help-inline,
.form-inline .uneditable-input,
.form-inline .input-prepend,
.form-inline .input-append,
/* XXX Oni Labs .form-inline surface-ui, */
/* XXX Oni Labs .form-inline .control-group, */
.form-horizontal input,
.form-horizontal textarea,
.form-horizontal select,
.form-horizontal .help-inline,
.form-horizontal .uneditable-input,
.form-horizontal .input-prepend
.form-horizontal .input-append /* XXX Oni Labs edit: remove for proper alignment of compound widgets */ {
    display: inline-block;
    #{mixins.ie7_inline_block()}
    margin-bottom: 0;
    vertical-align: middle;
}
  /* Re-hide hidden elements due to specifity */
.form-search .hide,
.form-inline .hide,
.form-horizontal .hide {
    display: none;
}

.form-search label,
.form-inline label,
.form-search .btn-group,
.form-inline .btn-group
 {
  display: inline-block;
  /* XXX Oni Labs edits:
  margin-bottom: 0;
  vertical-align: middle;
  */
}
/* Remove margin for input-prepend/-append */
.form-search .input-append,
.form-inline .input-append,
.form-search .input-prepend,
.form-inline .input-prepend {
  margin-bottom: 0;
}
/* Inline checkbox/radio labels (remove padding on left) */
.form-search .radio,
.form-search .checkbox,
.form-inline .radio,
.form-inline .checkbox {
  padding-left: 0;
  margin-bottom: 0;
  vertical-align: middle;
}
/* Remove float and margin, set to inline-block */
.form-search .radio input[type='radio'],
.form-search .checkbox input[type='checkbox'],
.form-inline .radio input[type='radio'],
.form-inline .checkbox input[type='checkbox'] {
  float: left;
  margin-right: 3px;
  margin-left: 0;
}


/* Margin to space out fieldsets */
.control-group {
  margin-bottom: #{scale(vars.baseLineHeight(), 1/2)};
}

/* Legend collapses margin, so next element is responsible for spacing */
legend + .control-group {
  margin-top: #{vars.baseLineHeight()};
  -webkit-margin-top-collapse: separate;
}

/* Horizontal-specific styles */
/* -------------------------- */

  /* Increase spacing between groups */
.form-horizontal .control-group {
    margin-bottom: #{vars.baseLineHeight()};
}
#{mixins.clearfix('.form-horizontal .control-group')}

  /* Float the labels left */
.form-horizontal .control-label {
    float: left;
    width: #{vars.horizontalComponentOffset() .. add(-20)};
    padding-top: 5px;
    text-align: right;
}
  /* Move over all input controls and content */
.form-horizontal .controls {
    /* Super jank IE7 fix to ensure the inputs in .input-append and input-prepend */
    /* don't inherit the margin of the parent, in this case .controls */
    *display: inline-block;
    *padding-left: 20px;
    margin-left: #{vars.horizontalComponentOffset()};
    *margin-left: 0;
}

.form-horizontal .controls:first-child {
      *padding-left: #{vars.horizontalComponentOffset()};
}

  /* Remove bottom margin on block level help text since that's accounted for on .control-group */
.form-horizontal .help-block {
    margin-bottom: 0;
}
  /* And apply it only to .help-block instances that follow a form control */
  .form-horizontal input + .help-block,
  .form-horizontal select + .help-block,
  .form-horizontal textarea + .help-block,
  .form-horizontal .uneditable-input + .help-block,
  .form-horizontal .input-prepend + .help-block,
  .form-horizontal .input-append + .help-block {
    margin-top: #{scale(vars.baseLineHeight(),1/2)};
}

  /* Move over buttons in .form-actions to align with .controls */
.form-horizontal .form-actions {
    padding-left: #{vars.horizontalComponentOffset()};
}
";

  return rv;
};
