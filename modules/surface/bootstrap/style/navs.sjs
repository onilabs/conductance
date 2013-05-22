var { scope } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* BASE CLASS */
/* ---------- */

.nav {
  margin-left: 0;
  margin-bottom: #{vars.baseLineHeight()};
  list-style: none;
}

/* Make links block level */
.nav > li > a {
  display: block;
}
.nav > li > a:hover,
.nav > li > a:focus {
  text-decoration: none;
  background-color: #{vars.grayLighter()};
}

/* Prevent IE8 from misplacing imgs */
/* See https://github.com/h5bp/html5-boilerplate/issues/984#issuecomment-3985989 */
.nav > li > a > img {
  max-width: none;
}

/* Redeclare pull classes because of specifity */
.nav > .pull-right {
  float: right;
}

/* Nav headers (for dropdowns and lists) */
.nav .nav-header {
  display: block;
  padding: 3px 15px;
  font-size: 11px;
  font-weight: bold;
  line-height: #{vars.baseLineHeight()};
  color: #{vars.grayLight()};
  text-shadow: 0 1px 0 rgba(255,255,255,.5);
  text-transform: uppercase;
}
/* Space them out when they follow another list item (link) */
.nav li + .nav-header {
  margin-top: 9px;
}


/* NAV LIST */
/* -------- */

.nav-list {
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 0;
}
.nav-list > li > a,
.nav-list .nav-header {
  margin-left:  -15px;
  margin-right: -15px;
  text-shadow: 0 1px 0 rgba(255,255,255,.5);
}
.nav-list > li > a {
  padding: 3px 15px;
}
.nav-list > .active > a,
.nav-list > .active > a:hover,
.nav-list > .active > a:focus {
  color: #{vars.white()};
  text-shadow: 0 -1px 0 rgba(0,0,0,.2);
  background-color: #{vars.linkColor()};
}
.nav-list [class^='icon-'],
.nav-list [class*=' icon-'] {
  margin-right: 2px;
}
/* Dividers (basically an hr) within the dropdown */
.nav-list .divider {
  #{mixins.nav_divider()}
}



/* TABS AND PILLS */
/* ------------- */

/* Common styles */
#{mixins.clearfix('.nav-tabs')}
#{mixins.clearfix('.nav-pills')}
.nav-tabs > li,
.nav-pills > li {
  float: left;
}
.nav-tabs > li > a,
.nav-pills > li > a {
  padding-right: 12px;
  padding-left: 12px;
  margin-right: 2px;
  line-height: 14px; /* keeps the overall height an even number */
}

/* TABS */
/* ---- */

/* Give the tabs something to sit on */
.nav-tabs {
  border-bottom: 1px solid #ddd;
}
/* Make the list-items overlay the bottom border */
.nav-tabs > li {
  margin-bottom: -1px;
}
/* Actual tabs (as links) */
.nav-tabs > li > a {
  padding-top: 8px;
  padding-bottom: 8px;
  line-height: #{vars.baseLineHeight()};
  border: 1px solid transparent;
  #{mixins.border_radius('4px 4px 0 0')}
}
.nav-tabs > li > a:hover,
.nav-tabs > li > a:focus {
    border-color: #{vars.grayLighter()} #{vars.grayLighter()} #ddd;
}

/* Active state, and it's :hover/:focus to override normal :hover/:focus */
.nav-tabs > .active > a,
.nav-tabs > .active > a:hover,
.nav-tabs > .active > a:focus {
  color: #{vars.gray()};
  background-color: #{vars.bodyBackground()};
  border: 1px solid #ddd;
  border-bottom-color: transparent;
  cursor: default;
}


/* PILLS */
/* ----- */

/* Links rendered as pills */
.nav-pills > li > a {
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 2px;
  margin-bottom: 2px;
  #{mixins.border_radius('5px')}
}

/* Active state */
.nav-pills > .active > a,
.nav-pills > .active > a:hover,
.nav-pills > .active > a:focus {
  color: #{vars.white()};
  background-color: #{vars.linkColor()};
}



/* STACKED NAV */
/* ----------- */

/* Stacked tabs and pills */
.nav-stacked > li {
  float: none;
}
.nav-stacked > li > a {
  margin-right: 0; /* no need for the gap between nav items */
}

/* Tabs */
.nav-tabs.nav-stacked {
  border-bottom: 0;
}
.nav-tabs.nav-stacked > li > a {
  border: 1px solid #ddd;
  #{mixins.border_radius('0')}
}
.nav-tabs.nav-stacked > li:first-child > a {
  #{mixins.border_top_radius('4px')}
}
.nav-tabs.nav-stacked > li:last-child > a {
  #{mixins.border_bottom_radius('4px')}
}
.nav-tabs.nav-stacked > li > a:hover,
.nav-tabs.nav-stacked > li > a:focus {
  border-color: #ddd;
  z-index: 2;
}

/* Pills */
.nav-pills.nav-stacked > li > a {
  margin-bottom: 3px;
}
.nav-pills.nav-stacked > li:last-child > a {
  margin-bottom: 1px; /* decrease margin to match sizing of stacked tabs */
}



/* DROPDOWNS */
/* --------- */

.nav-tabs .dropdown-menu {
  #{mixins.border_radius('0 0 6px 6px')} /* remove the top rounded corners here since there is a hard edge above the menu */
}
.nav-pills .dropdown-menu {
  #{mixins.border_radius('6px')} /* make rounded corners match the pills */
}

/* Default dropdown links */
/* ------------------------- */
/* Make carets use linkColor to start */
.nav .dropdown-toggle .caret {
  border-top-color: #{vars.linkColor()};
  border-bottom-color: #{vars.linkColor()};
  margin-top: 6px;
}
.nav .dropdown-toggle:hover .caret,
.nav .dropdown-toggle:focus .caret {
  border-top-color: #{vars.linkColorHover()};
  border-bottom-color: #{vars.linkColorHover()};
}
/* move down carets for tabs */
.nav-tabs .dropdown-toggle .caret {
  margin-top: 8px;
}

/* Active dropdown links */
/* ------------------------- */
.nav .active .dropdown-toggle .caret {
  border-top-color: #fff;
  border-bottom-color: #fff;
}
.nav-tabs .active .dropdown-toggle .caret {
  border-top-color: #{vars.gray()};
  border-bottom-color: #{vars.gray()};
}


/* Active:hover dropdown links */
/* ------------------------- */
.nav > .dropdown.active > a:hover,
 .nav > .dropdown.active > a:focus {
  cursor: pointer;
}

/* Open dropdowns */
/* ------------------------- */
.nav-tabs .open .dropdown-toggle,
.nav-pills .open .dropdown-toggle,
.nav > li.dropdown.open.active > a:hover,
.nav > li.dropdown.open.active > a:focus {
  color: #{vars.white()};
  background-color: #{vars.grayLight()};
  border-color: #{vars.grayLight()};
}
.nav li.dropdown.open .caret,
.nav li.dropdown.open.active .caret,
.nav li.dropdown.open a:hover .caret,
.nav li.dropdown.open a:focus .caret {
  border-top-color: #{vars.white()};
  border-bottom-color: #{vars.white()};
  #{mixins.opacity(100)}
}

/* Dropdowns in stacked tabs */
.tabs-stacked .open > a:hover,
.tabs-stacked .open > a:focus {
  border-color: #{vars.grayLight()};
}



/* TABBABLE */
/* -------- */


/* COMMON STYLES */
/* ------------- */

/* Clear any floats */
#{mixins.clearfix('.tabbable')}
.tab-content {
  overflow: auto; /* prevent content from running below tabs */
}

/* Remove border on bottom, left, right */
.tabs-below > .nav-tabs,
.tabs-right > .nav-tabs,
.tabs-left > .nav-tabs {
  border-bottom: 0;
}

/* Show/hide tabbable areas */
.tab-content > .tab-pane,
.pill-content > .pill-pane {
  display: none;
}
.tab-content > .active,
.pill-content > .active {
  display: block;
}


/* BOTTOM */
/* ------ */

.tabs-below > .nav-tabs {
  border-top: 1px solid #ddd;
}
.tabs-below > .nav-tabs > li {
  margin-top: -1px;
  margin-bottom: 0;
}
.tabs-below > .nav-tabs > li > a {
  #{mixins.border_radius('0 0 4px 4px')}
}
.tabs-below > .nav-tabs > li > a:hover,
.tabs-below > .nav-tabs > li > a:focus {
    border-bottom-color: transparent;
    border-top-color: #ddd;
}

.tabs-below > .nav-tabs > .active > a,
.tabs-below > .nav-tabs > .active > a:hover,
.tabs-below > .nav-tabs > .active > a:focus {
  border-color: transparent #ddd #ddd #ddd;
}

/* LEFT & RIGHT */
/* ------------ */

/* Common styles */
.tabs-left > .nav-tabs > li,
.tabs-right > .nav-tabs > li {
  float: none;
}
.tabs-left > .nav-tabs > li > a,
.tabs-right > .nav-tabs > li > a {
  min-width: 74px;
  margin-right: 0;
  margin-bottom: 3px;
}

/* Tabs on the left */
.tabs-left > .nav-tabs {
  float: left;
  margin-right: 19px;
  border-right: 1px solid #ddd;
}
.tabs-left > .nav-tabs > li > a {
  margin-right: -1px;
  #{mixins.border_radius('4px 0 0 4px')}
}
.tabs-left > .nav-tabs > li > a:hover,
.tabs-left > .nav-tabs > li > a:focus {
  border-color: #{vars.grayLighter()} #ddd #{vars.grayLighter()} #{vars.grayLighter()};
}
.tabs-left > .nav-tabs .active > a,
.tabs-left > .nav-tabs .active > a:hover,
.tabs-left > .nav-tabs .active > a:focus {
  border-color: #ddd transparent #ddd #ddd;
  *border-right-color: #{vars.white()};
}

/* Tabs on the right */
.tabs-right > .nav-tabs {
  float: right;
  margin-left: 19px;
  border-left: 1px solid #ddd;
}
.tabs-right > .nav-tabs > li > a {
  margin-left: -1px;
  #{mixins.border_radius('0 4px 4px 0')}
}
.tabs-right > .nav-tabs > li > a:hover,
.tabs-right > .nav-tabs > li > a:focus {
  border-color: #{vars.grayLighter()} #{vars.grayLighter()} #{vars.grayLighter()} #ddd;
}
.tabs-right > .nav-tabs .active > a,
.tabs-right > .nav-tabs .active > a:hover,
.tabs-right > .nav-tabs .active > a:focus {
  border-color: #ddd #ddd #ddd transparent;
  *border-left-color: #{vars.white()};
}

/* DISABLED STATES */
/* --------------- */

/* Gray out text */
.nav > .disabled > a {
  color: #{vars.grayLight()};
}
/* Nuke hover/focus effects */
.nav > .disabled > a:hover,
.nav > .disabled > a:focus {
  text-decoration: none;
  background-color: transparent;
  cursor: default;
}
";

  return rv;
};
