var { scope, scale, darken, add } = require('../../css');
var { integers, map, join } = require('sjs:sequence');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* BASE TABLES */

table {
  max-width: 100%;
  background-color: #{vars.tableBackground()};
  border-collapse: collapse;
  border-spacing: 0;
}

/* BASELINE STYLES */

.table {
  width: 100%;
  margin-bottom: #{vars.baseLineHeight()};
}
  /* Cells */
.table  th,
.table  td {
    padding: 8px;
    line-height: #{vars.baseLineHeight()};
    text-align: left;
    vertical-align: top;
    border-top: 1px solid #{vars.tableBorder()};
}

.table th {
    font-weight: bold;
}

  /* Bottom align for column headings */
.table thead th {
    vertical-align: bottom;
}

  /* Remove top border from thead by default */
.table caption + thead tr:first-child th,
.table caption + thead tr:first-child td,
.table colgroup + thead tr:first-child th,
.table colgroup + thead tr:first-child td,
.table thead:first-child tr:first-child th,
.table thead:first-child tr:first-child td {
    border-top: 0;
}
  /* Account for multiple tbody instances */
.table tbody + tbody {
    border-top: 2px solid #{vars.tableBorder()};
}

 /* Nesting */
.table .table {
  background-color: #{vars.bodyBackground()};
}

/* CONDENSED TABLE W/ HALF PADDING */

.table-condensed th,
.table-condensed td {
    padding: 4px 5px;
}


/* BORDERED VERSION */

.table-bordered {
  border: 1px solid #{vars.tableBorder()};
  border-collapse: separate; /* Done so we can round those corners! */
  *border-collapse: collapse; /* IE7 can't round corners anyway */
  border-left: 0;
  #{mixins.border_radius(vars.baseBorderRadius())}
}

.table-bordered th,
.table-bordered td {
    border-left: 1px solid #{vars.tableBorder()};
}

  /* Prevent a double border */
.table-bordered caption + thead tr:first-child th,
.table-bordered caption + tbody tr:first-child th,
.table-bordered caption + tbody tr:first-child td,
.table-bordered colgroup + thead tr:first-child th,
.table-bordered colgroup + tbody tr:first-child th,
.table-bordered colgroup + tbody tr:first-child td,
.table-bordered thead:first-child tr:first-child th,
.table-bordered tbody:first-child tr:first-child th,
.table-bordered tbody:first-child tr:first-child td {
    border-top: 0;
}

  /* For first th/td in the first row in the first thead or tbody */
.table-bordered  thead:first-child tr:first-child > th:first-child,
.table-bordered  tbody:first-child tr:first-child > td:first-child,
.table-bordered  tbody:first-child tr:first-child > th:first-child {
    #{mixins.border_top_left_radius(vars.baseBorderRadius())}
}

  /* For last th/td in the first row in the first thead or tbody */
.table-bordered  thead:first-child tr:first-child > th:last-child,
.table-bordered  tbody:first-child tr:first-child > td:last-child,
.table-bordered  tbody:first-child tr:first-child > th:last-child {
    #{mixins.border_top_right_radius(vars.baseBorderRadius())}
}
  /* For first th/td (can be either) in the last row in the last thead, tbody, and tfoot */
.table-bordered  thead:last-child tr:last-child > th:first-child,
.table-bordered  tbody:last-child tr:last-child > td:first-child,
.table-bordered  tbody:last-child tr:last-child > th:first-child,
.table-bordered  tfoot:last-child tr:last-child > td:first-child,
.table-bordered  tfoot:last-child tr:last-child > th:first-child {
    #{mixins.border_bottom_left_radius(vars.baseBorderRadius())}
}
  /* For last th/td (can be either) in the last row in the last thead, tbody, and tfoot */
.table-bordered  thead:last-child tr:last-child > th:last-child,
.table-bordered  tbody:last-child tr:last-child > td:last-child,
.table-bordered  tbody:last-child tr:last-child > th:last-child,
.table-bordered  tfoot:last-child tr:last-child > td:last-child,
.table-bordered  tfoot:last-child tr:last-child > th:last-child {
    #{mixins.border_bottom_right_radius(vars.baseBorderRadius())}
}

  /* Clear border-radius for first and last td in the last row in the last tbody for table with tfoot */
.table-bordered  tfoot + tbody:last-child tr:last-child td:first-child {
    #{mixins.border_bottom_left_radius('0')}
}
.table-bordered  tfoot + tbody:last-child tr:last-child td:last-child {
    #{mixins.border_bottom_right_radius('0')}
}

  /* Special fixes to round the left border on the first td/th */
.table-bordered  caption + thead tr:first-child th:first-child,
.table-bordered  caption + tbody tr:first-child td:first-child,
.table-bordered  colgroup + thead tr:first-child th:first-child,
.table-bordered  colgroup + tbody tr:first-child td:first-child {
    #{mixins.border_top_left_radius(vars.baseBorderRadius())}
}
.table-bordered  caption + thead tr:first-child th:last-child,
.table-bordered  caption + tbody tr:first-child td:last-child,
.table-bordered  colgroup + thead tr:first-child th:last-child,
.table-bordered  colgroup + tbody tr:first-child td:last-child {
    #{mixins.border_top_right_radius(vars.baseBorderRadius())}
}


/* ZEBRA-STRIPING */

/* Default zebra-stripe styles (alternating gray and transparent backgrounds) */
.table-striped tbody tr:nth-child(odd) td,
.table-striped tbody tr:nth-child(odd) th {
      background-color: #{vars.tableBackgroundAccent()};
}


/* HOVER EFFECT */
/* Placed here since it has to come after the potential zebra striping */
.table-hover tbody tr:hover > td,
.table-hover tbody tr:hover > th {
    background-color: #{vars.tableBackgroundHover()};
}


/* TABLE CELL SIZING */

/* Reset default grid behavior */
table td[class*='span'],
table th[class*='span'],
.row-fluid table td[class*='span'],
.row-fluid table th[class*='span'] {
  display: table-cell;
  float: none; /* undo default grid column styles */
  margin-left: 0; /* undo default grid column styles */
}


/* Change the columns */
 #{ integers(1,12) .. 
    map(i => "table td .span#{i}, table th .span#{i} { #{ mixins.tableColumns(i) } }") .. 
    join(' ')
  }

/* TABLE BACKGROUNDS */
/* Exact selectors below required to override .table-striped */

.table tbody tr.success td {
  background-color: #{vars.successBackground()};
}
.table tbody tr.error td {
  background-color: #{vars.errorBackground()};
}
.table tbody tr.warning td {
  background-color: #{vars.warningBackground()};
}
.table tbody tr.info td {
  background-color: #{vars.infoBackground()};
}

/* Hover states for .table-hover */
.table-hover tbody tr.success:hover td {
  background-color: #{darken(vars.successBackground(), 0.05)};
}
.table-hover tbody tr.error:hover td {
  background-color: #{darken(vars.errorBackground(), 0.05)};

}
.table-hover tbody tr.warning:hover td {
  background-color: #{darken(vars.warningBackground(), 0.05)};
}
.table-hover tbody tr.info:hover td {
  background-color: #{darken(vars.infoBackground(), 0.05)};
}
";

  return rv;
};
