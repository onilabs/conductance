var { scope,  scale } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* Make the div behave like a button */
.btn-group {
  position: relative;
  display: inline-block;
  #{mixins.ie7_inline_block()}
  font-size: 0; /* remove as part 1 of font-size inline-block hack */
  vertical-align: middle; /* prevent buttons from wrapping when in tight spaces (e.g., the table on the tests page) */
}
#{mixins.ie7_restore_left_whitespace('.btn-group')}

/* Space out series of button groups */
.btn-group + .btn-group {
  margin-left: 5px;
}

/* Optional: Group multiple button groups together for a toolbar */
.btn-toolbar {
  font-size: 0; /* Hack to remove whitespace that results from using inline-block */
  margin-top: #{scale(vars.baseLineHeight(), 1/2)};
  margin-bottom: #{scale(vars.baseLineHeight(), 1/2)};
}
.btn-toolbar  > .btn + .btn,
.btn-toolbar  > .btn-group + .btn,
.btn-toolbar  > .btn + .btn-group {
    margin-left: 5px;
}

/* Float them, remove border radius, then re-add to first and last elements */
.btn-group > .btn {
  position: relative;
  #{mixins.border_radius('0')}
}
.btn-group > .btn + .btn {
  margin-left: -1px;
}
.btn-group > .btn,
.btn-group > .dropdown-menu,
.btn-group > .popover {
  font-size: #{vars.baseFontSize()}; /* redeclare as part 2 of font-size inline-block hack */
}

/* Reset fonts for other sizes */
.btn-group > .btn-mini {
  font-size: #{vars.fontSizeMini()};
}
.btn-group > .btn-small {
  font-size: #{vars.fontSizeSmall()};
}
.btn-group > .btn-large {
  font-size: #{vars.fontSizeLarge()};
}

/* Set corners individual because sometimes a single button can be in a .btn-group and we need :first-child and :last-child to both match */
.btn-group > .btn:first-child {
  margin-left: 0;
  #{mixins.border_top_left_radius(vars.baseBorderRadius())}
  #{mixins.border_bottom_left_radius(vars.baseBorderRadius())}
}
/* Need .dropdown-toggle since :last-child doesn't apply given a .dropdown-menu immediately after it */
.btn-group > .btn:last-child,
.btn-group > .dropdown-toggle {
  #{mixins.border_top_right_radius(vars.baseBorderRadius())}
  #{mixins.border_bottom_right_radius(vars.baseBorderRadius())}
}
/* Reset corners for large buttons */
.btn-group > .btn.large:first-child {
  margin-left: 0;
  #{mixins.border_top_left_radius(vars.borderRadiusLarge())}
  #{mixins.border_bottom_left_radius(vars.borderRadiusLarge())}
}
.btn-group > .btn.large:last-child,
.btn-group > .large.dropdown-toggle {
  #{mixins.border_top_right_radius(vars.borderRadiusLarge())}
  #{mixins.border_bottom_right_radius(vars.borderRadiusLarge())}
}

/* On hover/focus/active, bring the proper btn to front */
.btn-group > .btn:hover,
.btn-group > .btn:focus,
.btn-group > .btn:active,
.btn-group > .btn.active {
  z-index: 2;
}

/* On active and open, don't show outline */
.btn-group .dropdown-toggle:active,
.btn-group.open .dropdown-toggle {
  outline: 0;
}



/* Split button dropdowns */
/* ---------------------- */

/* Give the line between buttons some depth */
.btn-group > .btn + .dropdown-toggle {
  padding-left: 8px;
  padding-right: 8px;
  #{mixins.box_shadow('inset 1px 0 0 rgba(255,255,255,.125), inset 0 1px 0 rgba(255,255,255,.2), 0 1px 2px rgba(0,0,0,.05)')}
  *padding-top: 5px;
  *padding-bottom: 5px;
}
.btn-group > .btn-mini + .dropdown-toggle {
  padding-left: 5px;
  padding-right: 5px;
  *padding-top: 2px;
  *padding-bottom: 2px;
}
.btn-group > .btn-small + .dropdown-toggle {
  *padding-top: 5px;
  *padding-bottom: 4px;
}
.btn-group > .btn-large + .dropdown-toggle {
  padding-left: 12px;
  padding-right: 12px;
  *padding-top: 7px;
  *padding-bottom: 7px;
}

/* The clickable button for toggling the menu */
/* Remove the gradient and set the same inset shadow as the :active state */
.btn-group.open .dropdown-toggle {
    background-image: none;
    #{mixins.box_shadow('inset 0 2px 4px rgba(0,0,0,.15), 0 1px 2px rgba(0,0,0,.05)')}
}

  /* Keep the hover's background when dropdown is open */
.btn-group.open .btn.dropdown-toggle {
    background-color: #{vars.btnBackgroundHighlight()};
}
.btn-group.open .btn-primary.dropdown-toggle {
    background-color: #{vars.btnPrimaryBackgroundHighlight()};
}
.btn-group.open .btn-warning.dropdown-toggle {
    background-color: #{vars.btnWarningBackgroundHighlight()};
}
.btn-group.open .btn-danger.dropdown-toggle {
    background-color: #{vars.btnDangerBackgroundHighlight()};
}
.btn-group.open .btn-success.dropdown-toggle {
    background-color: #{vars.btnSuccessBackgroundHighlight()};
}
.btn-group.open .btn-info.dropdown-toggle {
    background-color: #{vars.btnInfoBackgroundHighlight()};
}
.btn-group.open .btn-inverse.dropdown-toggle {
    background-color: #{vars.btnInverseBackgroundHighlight()};
}


/* Reposition the caret */
.btn .caret {
  margin-top: 8px;
  margin-left: 0;
}
/* Carets in other button sizes */
.btn-large .caret {
  margin-top: 6px;
}
.btn-large .caret {
  border-left-width:  5px;
  border-right-width: 5px;
  border-top-width:   5px;
}
.btn-mini .caret,
.btn-small .caret {
  margin-top: 8px;
}
/* Upside down carets for .dropup */
.dropup .btn-large .caret {
  border-bottom-width: 5px;
}



/* Account for other colors */
.btn-primary .caret,
.btn-warning .caret,
.btn-danger .caret,
.btn-info .caret,
.btn-success .caret,
.btn-inverse .caret {
    border-top-color: #{vars.white()};
    border-bottom-color: #{vars.white()};
}

/* Vertical button groups */
/* ---------------------- */

.btn-group-vertical {
  display: inline-block; /* makes buttons only take up the width they need */
  #{mixins.ie7_inline_block()}
}
.btn-group-vertical > .btn {
  display: block;
  float: none;
  max-width: 100%;
  #{mixins.border_radius('0')}
}
.btn-group-vertical > .btn + .btn {
  margin-left: 0;
  margin-top: -1px;
}
.btn-group-vertical > .btn:first-child {
  #{mixins.border_radius("#{vars.baseBorderRadius()} #{vars.baseBorderRadius()} 0 0")}
}
.btn-group-vertical > .btn:last-child {
  #{mixins.border_radius("0 0 #{vars.baseBorderRadius()} #{vars.baseBorderRadius()}")}
}
.btn-group-vertical > .btn-large:first-child {
  #{mixins.border_radius("#{vars.borderRadiusLarge()} #{vars.borderRadiusLarge()} 0 0")}
}
.btn-group-vertical > .btn-large:last-child {
  #{mixins.border_radius("0 0 #{vars.borderRadiusLarge()} #{vars.borderRadiusLarge()}")}
}

";

  return rv;
};
