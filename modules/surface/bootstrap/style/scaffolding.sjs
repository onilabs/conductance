var { scope } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* Body reset */
/* ---------- */

@global {
  body {
    margin: 0;
    font-family: #{vars.baseFontFamily()};
    font-size: #{vars.baseFontSize()};
    line-height: #{vars.baseLineHeight()};
    color: #{vars.textColor()};
    background-color: #{vars.bodyBackground()};
  }
}

/* Links */
/* ----- */

a {
  color: #{vars.linkColor()};
  text-decoration: none;
}
a:hover,
a:focus {
  color: #{vars.linkColorHover()};
  text-decoration: underline;
}

/* Images */
/* ------------------------- */

/* Rounded corners */
.img-rounded {
  #{mixins.border_radius('6px')}
}

/* Add polaroid-esque trim */
.img-polaroid {
  padding: 4px;
  background-color: #fff;
  border: 1px solid #ccc;
  border: 1px solid rgba(0,0,0,.2);
  #{mixins.box_shadow('0 1px 3px rgba(0,0,0,.1)')}
}

/* Perfect circle */
.img-circle {
  #{mixins.border_radius('500px')} /* crank the border-radius so it works with most reasonably sized images */
}
";

  return rv;
};
