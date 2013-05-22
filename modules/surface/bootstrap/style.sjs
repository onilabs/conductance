exports.css = function(vars, mixins) {  
  vars  = vars || require('./variables').defaultLookAndFeel;
  mixins = mixins || require('./mixins').Mixins(vars);

  var rv = "\
/* CSS Reset */
  #{ require('./style/reset').css(vars, mixins) }

/* Grid system and page structure */
  #{ require('./style/scaffolding').css(vars, mixins) }
  #{ require('./style/grid').css(vars, mixins) } 
  #{ require('./style/layouts').css(vars, mixins) }


/* Base CSS */
  #{ require('./style/type').css(vars, mixins) }
  #{ require('./style/code').css(vars, mixins) }
  #{ require('./style/forms').css(vars, mixins) }
  #{ require('./style/tables').css(vars, mixins) }

/* Components: common */
  #{ require('./style/sprites').css(vars, mixins) }
  #{ require('./style/dropdowns').css(vars, mixins) }
  #{ require('./style/wells').css(vars, mixins) }
  /* #xx{ require('./style/component-animations').css(vars, mixins) } */
  #{ require('./style/close').css(vars, mixins) }

/* Components: Buttons & Alerts */
  #{ require('./style/buttons').css(vars, mixins) }
  #{ require('./style/button-groups').css(vars, mixins) }
  #{ require('./style/alerts').css(vars, mixins) } /* Note: alerts share common CSS with buttons and thus have styles in buttons.sjs */

/* Components: Nav */
  #{ require('./style/navs').css(vars, mixins) }
  #{ require('./style/navbar').css(vars, mixins) }

/* Components: Misc */
  #{ require('./style/labels-badges').css(vars, mixins) }

/* Utility classes */
  #{ require('./style/utilities').css(vars, mixins) } /* Has to be last to override when necessary */
";
  return rv;
};

