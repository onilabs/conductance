var { scope } = require('../css');

exports.css = function(vars, parent_class) {
  vars = vars || require('./variables').defaultLookAndFeel;
  var mixins = require('./mixins').Mixins(vars);

  var rv = "\
/*                  */
/* Utility classes  */
/* -------------------------------------------------- */


/* Quick floats */
.pull-right {
  float: right;
}
.pull-left {
  float: left;
}

/* Toggling content */
.hide {
  display: none;
}
.show {
  display: block;
}

/* Visibility */
.invisible {
  visibility: hidden;
}

/* For Affix plugin */
.affix {
  position: fixed;
}


/* Oni Labs edit: expose classes from mixins.sjs here: */
#{mixins.clearfix('.clearfix')}
.input-block-level { #{mixins.input_block_level()} }
" .. scope(parent_class);

  return rv;
};
