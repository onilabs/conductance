var { scope, scale, darken, add } = require('../css');

exports.css = function(vars, parent_class) {
  vars = vars || require('./variables').defaultLookAndFeel;
  var mixins = require('./mixins').Mixins(vars);

  var rv = "\
/* Base styles */
/* -------------------------------------------------- */

/* Core */
.btn {
  display: inline-block;
  #{mixins.ie7_inline_block()}
  padding: 4px 12px;
  margin-bottom: 0; /* For input.btn */
  font-size: #{vars.baseFontSize()};
  line-height: #{vars.baseLineHeight()};
  text-align: center;
  vertical-align: middle;
  cursor: pointer;
  border: 1px solid #{vars.btnBorder()};
  *border: 0; /* Remove the border to prevent IE7's black border on input:focus */
  border-bottom-color: #{darken(vars.btnBorder(), .1)};
  #{mixins.border_radius(vars.baseBorderRadius())}
  #{mixins.box_shadow('inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05)')}
}
#{mixins.ie7_restore_left_whitespace('.btn')} /* Give IE7 some love */
#{mixins.buttonBackground('.btn', vars.btnBackground(), vars.btnBackgroundHighlight(), vars.grayDark(), '0 1px 1px rgba(255,255,255,.75)')}

/* Hover state */
.btn:hover,
.btn:focus {
  color: #{vars.grayDark()};
  text-decoration: none;
  background-position: 0 -15px;

  /* transition is only when going to hover, otherwise the background */
  /* behind the gradient (there for IE<=9 fallback) gets mismatched */
  #{mixins.transition('background-position .1s linear')}
}

/* Focus state for keyboard and accessibility */
.btn:focus {
  #{mixins.tab_focus()}
}

/* Active state */
.btn.active,
.btn:active {
  background-image: none;
  outline: 0;
  #{mixins.box_shadow('inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05)')}
}

/* Disabled state */
.btn.disabled,
.btn[disabled] {
  cursor: default;
  background-image: none;
  #{mixins.opacity(65)}
  #{mixins.box_shadow('none')}
}


/* Button Sizes */
/* -------------------------------------------------- */

/* Large */
.btn-large {
  padding: #{vars.paddingLarge()};
  font-size: #{vars.fontSizeLarge()};
  #{mixins.border_radius(vars.borderRadiusLarge())}
}
.btn-large [class^='icon-'],
.btn-large [class*=' icon-'] {
  margin-top: 4px;
}

/* Small */
.btn-small {
  padding: #{vars.paddingSmall()};
  font-size: #{vars.fontSizeSmall()};
  #{mixins.border_radius(vars.borderRadiusSmall())}
}
.btn-small [class^='icon-'],
.btn-small [class*=' icon-'] {
  margin-top: 0;
}
.btn-mini [class^='icon-'],
.btn-mini [class*=' icon-'] {
  margin-top: -1px;
}

/* Mini */
.btn-mini {
  padding: #{vars.paddingMini()};
  font-size: #{vars.fontSizeMini()};
  #{mixins.border_radius(vars.borderRadiusSmall())}
}

/* Block button */
/* ------------------------- */

.btn-block {
  display: block;
  width: 100%;
  padding-left: 0;
  padding-right: 0;
  #{mixins.box_sizing('border-box')}
}

/* Vertically space out multiple block buttons */
.btn-block + .btn-block {
  margin-top: 5px;
}

/* Specificity overrides */
input[type='submit'].btn-block,
input[type='reset'].btn-block,
input[type='button'].btn-block {
    width: 100%;
}


/* Alternate buttons */
/* -------------------------------------------------- */

/* Provide *some* extra contrast for those who can get it */
.btn-primary.active,
.btn-warning.active,
.btn-danger.active,
.btn-success.active,
.btn-info.active,
.btn-inverse.active {
  color: rgba(255,255,255,.75);
}

/* Set the backgrounds */
/* ------------------------- */
#{mixins.buttonBackground('.btn-primary', vars.btnPrimaryBackground(), vars.btnPrimaryBackgroundHighlight())}
/* Warning appears are orange */
#{mixins.buttonBackground('.btn-warning', vars.btnWarningBackground(), vars.btnWarningBackgroundHighlight())}
/* Danger and error appear as red */
#{mixins.buttonBackground('.btn-danger', vars.btnDangerBackground(), vars.btnDangerBackgroundHighlight())}
/* Success appears as green */
#{mixins.buttonBackground('.btn-success', vars.btnSuccessBackground(), vars.btnSuccessBackgroundHighlight())}
/* Info appears as a neutral blue */
#{mixins.buttonBackground('.btn-info', vars.btnInfoBackground(), vars.btnInfoBackgroundHighlight())}
/* Inverse appears as dark gray */
#{mixins.buttonBackground('.btn-inverse', vars.btnInverseBackground(), vars.btnInverseBackgroundHighlight())}




/* Cross-browser Jank */
/* -------------------------------------------------- */

  /* Firefox 3.6 only I believe */
button.btn::-moz-focus-inner,
input[type='submit'].btn::-moz-focus-inner {
    padding: 0;
    border: 0;
}

  /* IE7 has some default padding on button controls */
button.btn,
input[type='submit'].btn {
  *padding-top: 3px;
  *padding-bottom: 3px;
}

button.btn.btn-large,
input[type='submit'].btn.btn-large {
    *padding-top: 7px;
    *padding-bottom: 7px;
}
button.btn.btn-small,
input[type='submit'].btn.btn-small {
    *padding-top: 3px;
    *padding-bottom: 3px;
}
button.btn.btn-mini,
input[type='submit'].btn.btn-mini {
    *padding-top: 1px;
    *padding-bottom: 1px;
}

/* Link buttons */
/* -------------------------------------------------- */

/* Make a button look and behave like a link */
.btn-link,
.btn-link:active,
.btn-link[disabled] {
  background-color: transparent;
  background-image: none;
  #{mixins.box_shadow('none')}
}
.btn-link {
  border-color: transparent;
  cursor: pointer;
  color: #{vars.linkColor()};
  #{mixins.border_radius('0')}
}
.btn-link:hover,
.btn-link:focus {
  color: #{vars.linkColorHover()};
  text-decoration: underline;
  background-color: transparent;
}
.btn-link[disabled]:hover,
.btn-link[disabled]:focus {
  color: #{vars.grayDark()};
  text-decoration: none;
}
" .. scope(parent_class);

  return rv;
};
