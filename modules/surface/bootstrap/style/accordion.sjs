var { scope, scale, darken } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/**/
/* Accordion */
/* -------------------------------------------------- */


/* Parent container */
.accordion {
  margin-bottom: #{vars.baseLineHeight()};
}

/* Group == heading + body */
.accordion-group {
  margin-bottom: 2px;
  border: 1px solid #e5e5e5;
  #{mixins.border_radius(vars.baseBorderRadius())}
}
.accordion-heading {
  border-bottom: 0;
}
.accordion-heading .accordion-toggle {
  display: block;
  padding: 8px 15px;
}

/* General toggle styles */
.accordion-toggle {
  cursor: pointer;
}

/* Inner needs the styles because you can't animate properly with any styles on the element */
.accordion-inner {
  padding: 9px 15px;
  border-top: 1px solid #e5e5e5;
}
";

  return rv;
};
