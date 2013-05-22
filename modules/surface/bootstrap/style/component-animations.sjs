var { scope, darken } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
.fade {
  opacity: 0;
  #{mixins.transition('opacity .15s linear')}
}
.fade.in {
    opacity: 1;
}

.collapse {
  position: relative;
  height:0;
  overflow: hidden;
  #{mixins.transition('height .35s ease')} 
}
.collapse.in {
  height: auto;
}
";

  return rv;
};
