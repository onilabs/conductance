var { scope, scale, darken, add } = require('../css');

exports.css = function(vars, parent_class) {
  vars = vars || require('./variables').defaultLookAndFeel;
  var mixins = require('./mixins').Mixins(vars);

  var rv = "\
/* Base styles */
.alert {
  padding: 8px 35px 8px 14px;
  margin-bottom: #{vars.baseLineHeight()};
  text-shadow: 0 1px 0 rgba(255,255,255,.5);
  background-color: #{vars.warningBackground()};
  border: 1px solid #{vars.warningBorder()};
  #{mixins.border_radius(vars.baseBorderRadius())}
}
.alert,
.alert h4 {
  /* Specified for the h4 to prevent conflicts of changing @headingsColor */
  color: #{vars.warningText()};
}
.alert h4 {
  margin: 0;
}

/* Adjust close link position */
.alert .close {
  position: relative;
  top: -2px;
  right: -21px;
  line-height: #{vars.baseLineHeight()};
}

/* Alternate styles */
/* ---------------- */

.alert-success {
  background-color: #{vars.successBackground()};
  border-color: #{vars.successBorder()};  
  color: #{vars.successText()};
}
.alert-success h4 {
  color: #{vars.successText()};
}
.alert-danger,
.alert-error {
  background-color: #{vars.errorBackground()};
  border-color: #{vars.errorBorder()};
  color: #{vars.errorText()};
}
.alert-danger h4,
.alert-error h4 {
  color: #{vars.errorText()};
}
.alert-info {
  background-color: #{vars.infoBackground()};
  border-color: #{vars.infoBorder()};
  color: #{vars.infoText()};
}
.alert-info h4 {
  color: #{vars.infoText()};
}


/* Block alerts */
/* ------------------------ */
.alert-block {
  padding-top: 14px;
  padding-bottom: 14px;
}
.alert-block > p,
.alert-block > ul {
  margin-bottom: 0;
}
.alert-block p + p {
  margin-top: 5px;
}
" .. scope(parent_class);

  return rv;
};
