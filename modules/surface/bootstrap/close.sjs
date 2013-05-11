var { scope, darken } = require('../css');

exports.css = function(vars, parent_class) {
  vars = vars || require('./variables').defaultLookAndFeel;
  var mixins = require('./mixins').Mixins(vars);

  var rv = "\
.close {
  float: right;
  font-size: 20px;
  font-weight: bold;
  line-height: #{vars.baseLineHeight()};
  color: #{vars.black()};
  text-shadow: 0 1px 0 rgba(255,255,255,1);
  #{mixins.opacity(20)}
}
.close:hover,
.close:focus {
    color: #{vars.black()};
    text-decoration: none;
    cursor: pointer;
    #{mixins.opacity(40)}
}

/* Additional properties for button version */
/* iOS requires the button element instead of an anchor tag. */
/* If you want the anchor version, it requires `href='#'`. */
button.close {
  padding: 0;
  cursor: pointer;
  background: transparent;
  border: 0;
  -webkit-appearance: none;
}
" .. scope(parent_class);

  return rv;
};
