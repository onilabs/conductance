var { scope } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* Layouts */
/* -------------------------------------------- */

/* Container (centered, fixed-width layouts) */
#{mixins.container_fixed('.container')}

/* Fluid layouts (left aligned, with sidebar, min- & max-width content) */
.container-fluid {
  padding-right: #{vars.gridGutterWidth()};
  padding-left: #{vars.gridGutterWidth()};
}
#{mixins.clearfix('.container-fluid')}
";

  return rv;
};
