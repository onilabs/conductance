var { scope, scale, darken } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* LABELS & BADGES */
/* --------------- */

/* Base classes */
.label,
.badge {
  display: inline-block;
  padding: 2px 4px;
  font-size: #{scale(vars.baseFontSize(),.846)};
  font-weight: bold;
  line-height: 14px; /* ensure proper line-height if floated */
  color: #{vars.white()};
  vertical-align: baseline;
  white-space: nowrap;
  text-shadow: 0 -1px 0 rgba(0,0,0,.25);
  background-color: #{vars.grayLight()};
}
/* Set unique padding and border-radii */
.label {
  #{mixins.border_radius('3px')}
}
.badge {
  padding-left: 9px;
  padding-right: 9px;
  #{mixins.border_radius('9px')}
}

/* Empty labels/badges collapse */
.label:empty,
.badge:empty {
    display: none;
}

/* Hover/focus state, but only for links */
a.label:hover,
a.label:focus,
a.badge:hover,
a.badge:focus {
    color: #{vars.white()};
    text-decoration: none;
    cursor: pointer;
}

/* Colors */
/* Only give background-color difference to links (and to simplify, we don't qualifty with `a` but [href] attribute) */
/* Important (red) */
.label-important, .badge-important { background-color: #{vars.errorText()}; }
.label-important[href],
.badge-important[href] { background-color: #{ darken(vars.errorText(), .1) }; }
/* Warnings (orange) */
.label-warning, .badge-warning { background-color: #{vars.orange()}; }
.label-warning[href], 
.badge-warning[href] { background-color: #{darken(vars.orange(), .1)}; }
  /* Success (green) */
.label-success, .badge-success { background-color: #{vars.successText()}; }
.label-success[href],
.badge-success[href] { background-color: #{darken(vars.successText(), .1)}; }
  /* Info (turquoise) */
.label-info, .badge-info { background-color: #{vars.infoText()}; }
.label-info[href], 
.badge-info[href]  { background-color: #{darken(vars.infoText(), .1)}; }
  /* Inverse (black) */
.label-inverse, .badge-inverse { background-color: #{vars.grayDark()}; }
.label-inverse[href], 
.badge-inverse[href] { background-color: #{darken(vars.grayDark(), .1)}; }

/* Quick fix for labels/badges in buttons */
.btn .label,
.btn .badge {
    position: relative;
    top: -1px;
}
.btn-mini .label,
.btn-mini .badge {
    top: 0;
}

";

  return rv;
};
