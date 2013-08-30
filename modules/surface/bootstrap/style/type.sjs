var { scope, scale, darken, add } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* Body text */
/* ------------------------- */

p {
  margin: 0 0 #{scale(vars.baseLineHeight(), 1/2)};
}
.lead {
  margin-bottom: #{vars.baseLineHeight()};
  font-size: #{vars.baseFontSize() .. scale(1.5)};
  font-weight: 200;
  line-height: #{vars.baseLineHeight() .. scale(1.5)};
}

/* Emphasis & Misc */
/* -------------------- */

/* Ex: 14px base font * 85% = about 12px */
small { font-size: 85%; }

strong { font-weight: bold; }
em {  font-style: italic; }
cite { font-style: normal; }

/* Utility classes */
.muted { color: #{vars.grayLight()}; }

a.muted:hover,
a.muted:focus        { color: #{ darken(vars.grayLight(), 0.1) }; }

.text-warning        { color: #{ vars.warningText() }; }
a.text-warning:hover,
a.text-warning:focus { color: #{ darken(vars.warningText(), 0.1) }; }

.text-error          { color: #{ vars.errorText() }; }
a.text-error:hover,
a.text-error:focus   { color: #{ darken(vars.errorText(), 0.1) }; }

.text-info           { color: #{ vars.infoText() }; }
a.text-info:hover,
a.text-info:focus    { color: #{ darken(vars.infoText(), 0.1) }; }

.text-success        { color: #{ vars.successText() }; }
a.text-success:hover,
a.text-success:focus { color: #{ darken(vars.successText(), 0.1) }; }

.text-left           { text-align: left; }
.text-right          { text-align: right; }
.text-center         { text-align: center; }


/* Headings */
/* ---------------------- */

h1, h2, h3, h4, h5, h6 {
  margin: #{ vars.baseLineHeight() .. scale(1/2) } 0;
  font-family: #{vars.headingsFontFamily()};
  font-weight: #{vars.headingsFontWeight()};
  line-height: #{vars.baseLineHeight()};
  color: #{vars.headingsColor()};
  text-rendering: optimizelegibility; /* Fix the character spacing for headings */
}
h1 small, h2 small, h3 small, h4 small, h5 small, h6 small {
    font-weight: normal;
    line-height: 1;
    color: #{vars.grayLight()};
}
h1, h2, h3 {
  line-height: #{scale(vars.baseLineHeight(), 2)};
}

h1 { font-size: #{vars.fontSizeH1()}; } /* Oni Labs edit */
h2 { font-size: #{vars.fontSizeH2()}; } /* Oni Labs edit */
h3 { font-size: #{vars.fontSizeH3()}; } /* Oni Labs edit */
h4 { font-size: #{vars.fontSizeH4() }; } /* Oni Labs edit */
h5 { font-size: #{vars.fontSizeH5() }; } /* Oni Labs edit */
h6 { font-size: #{vars.fontSizeH6() }; } /* Oni Labs edit */

h1 small { font-size: #{vars.fontSizeH1Small() }; } /* Oni Labs edit */
h2 small { font-size: #{vars.fontSizeH2Small() }; } /* Oni Labs edit */
h3 small { font-size: #{vars.fontSizeH3Small() }; } /* Oni Labs edit */
h4 small { font-size: #{vars.fontSizeH4Small() }; } /* Oni Labs edit */


/* Page header */
/* ---------------- */

.page-header {
  padding-bottom: #{add(vars.baseLineHeight() .. scale(1/2), -1)};
  margin: #{vars.baseLineHeight()} 0 #{vars.baseLineHeight() .. scale(1.5)};
  border-bottom: 1px solid #{vars.grayLighter()};
}


/* Lists */
/* ----------------- */

/* Unordered and Ordered lists */
ul, ol {
  padding: 0;
  margin: 0 0 #{scale(vars.baseLineHeight(), 1/2)} 25px;
}
ul ul,
ul ol,
ol ol,
ol ul {
  margin-bottom: 0;
}
li {
  line-height: #{vars.baseLineHeight()};
}

/* Remove default list styles */
ul.unstyled,
ol.unstyled {
  margin-left: 0;
  list-style: none;
}

/* Single-line list items */
ul.inline,
ol.inline {
  margin-left: 0;
  list-style: none;
}

ul.inline > li,
ol.inline > li {
  display: inline-block;
  #{mixins.ie7_inline_block()}
  padding-left: 5px;
  padding-right: 5px;
}

/* Description Lists */
dl {
  margin-bottom: #{vars.baseLineHeight()};
}
dt,
dd {
  line-height: #{vars.baseLineHeight()};
}
dt {
  font-weight: bold;
}
dd {
  margin-left: #{scale(vars.baseLineHeight()/2)};
}
/* Horizontal layout (like forms) */
#{mixins.clearfix('.dl-horizontal')} /* Ensure dl clears floats if empty dd elements present */
.dl-horizontal dt {
    float: left;
    width: #{vars.horizontalComponentOffset() .. add(-20)};
    clear: left;
    text-align: right;
    #{mixins.text_overflow()}
}
.dl-horizontal dd {
    margin-left: #{vars.horizontalComponentOffset()};
}

/* MISC */
/* ---- */

/* Horizontal rules */
hr {
  margin: #{vars.baseLineHeight()} 0;
  border: 0;
  border-top: 1px solid #{vars.hrBorder()};
  border-bottom: 1px solid #{vars.white()};
}


/* Abbreviations and acronyms */
abbr[title],
/* Added data-* attribute to help out our tooltip plugin, per https://github.com/twitter/bootstrap/issues/5257 */
abbr[data-original-title]
 {
  cursor: help;
  border-bottom: 1px dotted #{vars.grayLight()};
}
abbr.initialism {
  font-size: 90%;
  text-transform: uppercase;
}

/* Blockquotes */
blockquote {
  padding: 0 0 0 15px;
  margin: 0 0 #{vars.baseLineHeight()};
  border-left: 5px solid #{vars.grayLighter()};
}

blockquote p {
    margin-bottom: 0;
    font-size: #{vars.baseFontSize() .. scale(1.25)};
    font-weight: 300;
    line-height: 1.25;
}

blockquote small {
    display: block;
    line-height: #{vars.baseLineHeight()};
    color: #{vars.grayLight()};
}

blockquote small:before {
      content: '\\2014 \\00A0';
}

  /* Float right with text-align: right */
blockquote.pull-right {
    float: right;
    padding-right: 15px;
    padding-left: 0;
    border-right: 5px solid #{vars.grayLighter()};
    border-left: 0;
}

blockquote.pull-right p,
blockquote.pull-right small {
      text-align: right;
}

blockquote.pull-right small:before {
        content: '';
}
blockquote.pull-right small:after {
        content: '\\00A0 \\2014';
}
 
/* Quotes */
q:before,
q:after,
blockquote:before,
blockquote:after {
  content: '';
}

/* Addresses */
address {
  display: block;
  margin-bottom: #{vars.baseLineHeight()};
  font-style: normal;
  line-height: #{vars.baseLineHeight()};
}

";

  return rv;
};
