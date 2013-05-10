var { scope } = require('../css');

exports.css = function(vars, parent_class) {
  vars = vars || require('./variables').defaultLookAndFeel;
  var mixins = require('./mixins').Mixins(vars);

  var rv = "\
/*                                                    */
/* Grid system                                        */
/* -------------------------------------------------- */


/* Fixed (940px) */
#{ mixins.grid.core(vars.gridColumnWidth(), vars.gridGutterWidth()) }

/* Fluid (940px) */
#{ mixins.grid.fluid(vars.fluidGridColumnWidth(), vars.fluidGridGutterWidth()) } 

// Reset utility classes due to specificity
[class*='span'].hide,
.row-fluid [class*='span'].hide {
  display: none;
}

[class*='span'].pull-right,
.row-fluid [class*='span'].pull-right {
  float: right;
}

" .. scope(parent_class);

  return rv;
};
