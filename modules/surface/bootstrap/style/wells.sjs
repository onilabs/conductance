var { scope, darken } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
.well {
  min-height: 20px;
  padding: 19px;
  margin-bottom: 20px;
  background-color: #{vars.wellBackground()};
  border: 1px solid #{vars.wellBackground() .. darken(.07)};
  #{mixins.border_radius(vars.baseBorderRadius())}
  #{mixins.box_shadow('inset 0 1px 1px rgba(0,0,0,.05)')}
}

.well blockquote {
    border-color: #ddd;
    border-color: rgba(0,0,0,.15);
}

/* Sizes */
.well-large {
  padding: 24px;
  #{mixins.border_radius(vars.borderRadiusLarge())}
}
.well-small {
  padding: 9px;
  #{mixins.border_radius(vars.borderRadiusSmall())}
}
";

  return rv;
};
