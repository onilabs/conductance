var { scope, add, scale, subtract, darken } = require('../../css');

exports.css = function(vars, mixins) {
  vars = vars || require('../variables').defaultLookAndFeel;
  mixins = mixins || require('../mixins').Mixins(vars);

  var rv = "\
/* COMMON STYLES */
/* ------------- */

.navbar {
  overflow: visible;
  margin-bottom: #{vars.baseLineHeight()};

  /* Fix for IE7's bad z-indexing so dropdowns don't appear below content that follows the navbar */
  *position: relative;
  *z-index: 2;
}

/* Inner for background effects */
/* Gradient is applied to it's own element because overflow visible is not honored by IE when filter is present */
.navbar-inner {
  min-height: #{vars.navbarHeight()};
  padding-left:  20px;
  padding-right: 20px;
  #{mixins.gradient.vertical(vars.navbarBackgroundHighlight(), vars.navbarBackground()) }
  border: 1px solid #{vars.navbarBorder()};
  #{mixins.border_radius(vars.baseBorderRadius())}
  #{mixins.box_shadow('0 1px 4px rgba(0,0,0,.065)')}
}
/* Prevent floats from breaking the navbar */
#{mixins.clearfix('.navbar-inner')}

/* Set width to auto for default container */
/* We then reset it for fixed navbars in the #gridSystem mixin */
.navbar .container {
  width: auto;
}

/* Override the default collapsed state */
.nav-collapse.collapse {
  height: auto;
}


  /* Website or project name */
.navbar .brand {
  float: left;
  display: block;
  /* Vertically center the text given @navbarHeight */
  padding: #{(vars.navbarHeight() .. subtract(vars.baseLineHeight())) .. scale(1/2)} 20px #{(vars.navbarHeight() .. subtract(vars.baseLineHeight())) .. scale(1/2)};
  margin-left: -20px; /* negative indent to left-align the text down the page */
  font-size: 20px;
  font-weight: 200;
  color: #{vars.navbarBrandColor()};
  text-shadow: 0 1px 0 #{vars.navbarBackgroundHighlight()};
}
.navbar .brand:hover,
.navbar .brand:focus {
    text-decoration: none;
}

  /* Plain text in topbar */
.navbar-text {
  margin-bottom: 0;
  line-height: #{vars.navbarHeight()};
  color: #{vars.navbarText()};
}

  /* Janky solution for now to account for links outside the .nav */
.navbar-link {
  color: #{vars.navbarLinkColor()};
}
.navbar-link:hover,
.navbar-link:focus {
      color: #{vars.navbarLinkColorHover()};
}

  /* Dividers in navbar */
.navbar .divider-vertical {
  height: #{vars.navbarHeight()};
  margin: 0 9px;
  border-left: 1px solid #{vars.navbarBackground()};
  border-right: 1px solid #{vars.navbarBackgroundHighlight()};
}

  /* Buttons in navbar */
.navbar .btn,
.navbar .btn-group {
    #{mixins.navbarVerticalAlign('30px')} /* Vertically center in navbar */
}
.navbar .btn-group .btn,
.navbar .input-prepend .btn,
.navbar .input-append .btn,
.navbar .input-prepend .btn-group,
.navbar .input-append .btn-group {
    margin: 0; /* then undo the margin here so we don't accidentally double it */
}

/* Navbar forms */
.navbar-form {
  margin-bottom: 0; /* remove default bottom margin */
}
#{mixins.clearfix('.navbar-form')}

.navbar-form input,
.navbar-form select,
.navbar-form .radio,
.navbar-form .checkbox {
    #{mixins.navbarVerticalAlign('30px')} /* Vertically center in navbar */
}
.navbar-form input,
.navbar-form select,
.navbar-form .btn {
    display: inline-block;
    margin-bottom: 0;
}
.navbar-form input[type='image'],
.navbar-form input[type='checkbox'],
.navbar-form input[type='radio'] {
    margin-top: 3px;
}
.navbar-form .input-append,
.navbar-form .input-prepend {
    margin-top: 5px;
    white-space: nowrap; /* preven two  items from separating within a .navbar-form that has .pull-left */
}

.navbar-form .input-append input,
.navbar-form .input-prepend input {
      margin-top: 0; /* remove the margin on top since it's on the parent */
}

/* Navbar search */
.navbar-search {
  position: relative;
  float: left;
  #{mixins.navbarVerticalAlign('30px')} /* Vertically center in navbar */
  margin-bottom: 0;
}
.navbar-search .search-query {
    margin-bottom: 0;
    padding: 4px 14px;
    #{mixins.font.sans_serif('13px', 'normal', '1')}
    #{mixins.border_radius('15px')} /* redeclare because of specificity of the type attribute */
}


/* Static navbar */
/* ------------------------- */

.navbar-static-top {
  position: static;
  margin-bottom: 0; /* remove 18px margin for default navbar */
}
.navbar-static-top .navbar-inner {
    #{mixins.border_radius('0')}
}


/* FIXED NAVBAR */
/* ------------ */

/* Shared (top/bottom) styles */
.navbar-fixed-top,
.navbar-fixed-bottom {
  position: fixed;
  right: 0;
  left: 0;
  z-index: #{vars.zindexFixedNavbar()};
  margin-bottom: 0; /* remove 18px margin for static navbar */
}
.navbar-fixed-top .navbar-inner,
.navbar-static-top .navbar-inner {
  border-width: 0 0 1px;
}
.navbar-fixed-bottom .navbar-inner {
  border-width: 1px 0 0;
}
.navbar-fixed-top .navbar-inner,
.navbar-fixed-bottom .navbar-inner {
  padding-left:  0;
  padding-right: 0;
  #{mixins.border_radius('0')}
}

/* Reset container width */
/* Required here as we reset the width earlier on and the grid mixins don't override early enough */
.navbar-static-top .container,
.navbar-fixed-top .container,
.navbar-fixed-bottom .container {
  #{mixins.grid.coreSpan(vars.gridColumns())}
}

/* Fixed to top */
.navbar-fixed-top {
  top: 0;
}
.navbar-fixed-top .navbar-inner,
.navbar-static-top .navbar-inner {
    #{mixins.box_shadow('0 1px 10px rgba(0,0,0,.1)')}
}

/* Fixed to bottom */
.navbar-fixed-bottom {
  bottom: 0;
}
.navbar-fixed-bottom .navbar-inner {
    #{mixins.box_shadow('0 -1px 10px rgba(0,0,0,.1)')}
}


/* NAVIGATION */
/* ---------- */

.navbar .nav {
  position: relative;
  left: 0;
  display: block;
  float: left;
  margin: 0 10px 0 0;
}
.navbar .nav.pull-right {
  float: right; /* redeclare due to specificity */
  margin-right: 0; /* remove margin on float right nav */
}
.navbar .nav > li {
  float: left;
}

/* Links */
.navbar .nav > li > a {
  float: none;
  /* Vertically center the text given @navbarHeight */
  padding: #{(vars.navbarHeight() .. subtract(vars.baseLineHeight())) .. scale(1/2)} 15px #{(vars.navbarHeight() .. subtract(vars.baseLineHeight())) .. scale(1/2)};
  color: #{vars.navbarLinkColor()};
  text-decoration: none;
  text-shadow: 0 1px 0 #{vars.navbarBackgroundHighlight()};
}
.navbar .nav .dropdown-toggle .caret {
  margin-top: 8px;
}


/* Hover/focus */
.navbar .nav > li > a:hover,
.navbar .nav > li > a:focus {
  background-color: #{vars.navbarLinkBackgroundHover()}; /* 'transparent' is default to differentiate :hover from .active */
  color: #{vars.navbarLinkColorHover()};
  text-decoration: none;
}

/* Active nav items */
.navbar .nav .active > a,
.navbar .nav .active > a:hover,
.navbar .nav .active > a:focus {
  color: #{vars.navbarLinkColorActive()};
  text-decoration: none;
  background-color: #{vars.navbarLinkBackgroundActive()};
  #{mixins.box_shadow('inset 0 3px 8px rgba(0,0,0,.125)')}
}


/* Navbar button for toggling navbar items in responsive layouts */
/* These definitions need to come after '.navbar .btn' */
.navbar .btn-navbar {
  display: none;
  float: right;
  padding: 7px 10px;
  margin-left: 5px;
  margin-right: 5px;
  #{mixins.box_shadow('inset 0 1px 0 rgba(255,255,255,.1), 0 1px 0 rgba(255,255,255,.075)')}
}
#{mixins.buttonBackground('.navbar .btn-navbar', 
                          vars.navbarBackgroundHighlight() .. darken(.05), 
                          vars.navbarBackground() .. darken(.05))}

.navbar .btn-navbar .icon-bar {
  display: block;
  width: 18px;
  height: 2px;
  background-color: #f5f5f5;
  #{mixins.border_radius('1px')}
  #{mixins.box_shadow('0 1px 0 rgba(0,0,0,.25)')}
}
.btn-navbar .icon-bar + .icon-bar {
  margin-top: 3px;
}


/* Dropdown menus */
/* -------------- */

/* Menu position and menu carets */
.navbar .nav > li > .dropdown-menu:before {
    content: '';
    display: inline-block;
    border-left:   7px solid transparent;
    border-right:  7px solid transparent;
    border-bottom: 7px solid #ccc;
    border-bottom-color: #{vars.dropdownBorder()};
    position: absolute;
    top: -7px;
    left: 9px;
}
.navbar .nav > li > .dropdown-menu:after {
    content: '';
    display: inline-block;
    border-left:   6px solid transparent;
    border-right:  6px solid transparent;
    border-bottom: 6px solid #{vars.dropdownBackground()};
    position: absolute;
    top: -6px;
    left: 10px;
}

/* Menu position and menu caret support for dropups via extra dropup class */
.navbar-fixed-bottom .nav > li > .dropdown-menu:before {
    border-top: 7px solid #ccc;
    border-top-color: #{vars.dropdownBorder()};
    border-bottom: 0;
    bottom: -7px;
    top: auto;
}
.navbar-fixed-bottom .nav > li > .dropdown-menu:after {
    border-top: 6px solid #{vars.dropdownBackground()};
    border-bottom: 0;
    bottom: -6px;
    top: auto;
}

/* Caret should match text color on hover/focus */
.navbar .nav li.dropdown > a:hover .caret,
.navbar .nav li.dropdown > a:focus .caret {
  border-top-color: #{vars.navbarLinkColorHover()};
  border-bottom-color: #{vars.navbarLinkColorHover()};
}


/* Remove background color from open dropdown */
.navbar .nav li.dropdown.open > .dropdown-toggle,
.navbar .nav li.dropdown.active > .dropdown-toggle,
.navbar .nav li.dropdown.open.active > .dropdown-toggle {
  background-color: #{vars.navbarLinkBackgroundActive()};
  color: #{vars.navbarLinkColorActive()};
}

//XXXXX

.navbar .nav li.dropdown > .dropdown-toggle .caret {
  border-top-color: #{vars.navbarLinkColor()};
  border-bottom-color: #{vars.navbarLinkColor()};
}
.navbar .nav li.dropdown.open > .dropdown-toggle .caret,
.navbar .nav li.dropdown.active > .dropdown-toggle .caret,
.navbar .nav li.dropdown.open.active > .dropdown-toggle .caret {
  border-top-color: #{vars.navbarLinkColorActive()};
  border-bottom-color: #{vars.navbarLinkColorActive()};
}

/* Right aligned menus need alt position */
.navbar .pull-right > li > .dropdown-menu,
.navbar .nav > li > .dropdown-menu.pull-right {
  left: auto;
  right: 0;
}
.navbar .pull-right > li > .dropdown-menu:before,
.navbar .nav > li > .dropdown-menu.pull-right:before {
    left: auto;
    right: 12px;
}
.navbar .pull-right > li > .dropdown-menu:after,
.navbar .nav > li > .dropdown-menu.pull-right:after {
    left: auto;
    right: 13px;
}
.navbar .pull-right > li > .dropdown-menu .dropdown-menu,
.navbar .nav > li > .dropdown-menu.pull-right .dropdown-menu {
    left: auto;
    right: 100%;
    margin-left: 0;
    margin-right: -1px;
    #{mixins.border_radius('6px 0 6px 6px')}
}


/* Inverted navbar */
/* ------------------------- */

.navbar-inverse .navbar-inner {
    #{mixins.gradient.vertical(vars.navbarInverseBackgroundHighlight(), vars.navbarInverseBackground())}
    border-color: #{vars.navbarInverseBorder()};
}

.navbar-inverse .brand,
.navbar-inverse .nav > li > a {
    color: #{vars.navbarInverseLinkColor()};
    text-shadow: 0 -1px 0 rgba(0,0,0,.25);
}
.navbar-inverse .brand:hover,
.navbar-inverse .nav > li > a:hover,
.navbar-inverse .brand:focus,
.navbar-inverse .nav > li > a:focus {
      color: #{vars.navbarInverseLinkColorHover()};
}

.navbar-inverse .brand {
    color: #{vars.navbarInverseBrandColor()};
}

.navbar-inverse .navbar-text {
    color: #{vars.navbarInverseText()};
  }

.navbar-inverse .nav > li > a:focus,
.navbar-inverse .nav > li > a:hover {
    background-color: #{vars.navbarInverseLinkBackgroundHover()};
    color: #{vars.navbarInverseLinkColorHover()};
  }

.navbar-inverse .nav .active > a,
.navbar-inverse .nav .active > a:hover,
.navbar-inverse .nav .active > a:focus {
    color: #{vars.navbarInverseLinkColorActive()};
    background-color: #{vars.navbarInverseLinkBackgroundActive()};
  }

  /* Inline text links */
.navbar-inverse .navbar-link {
    color: #{vars.navbarInverseLinkColor()};
  }
.navbar-inverse .navbar-link:hover,
.navbar-inverse .navbar-link:focus {
      color: #{vars.navbarInverseLinkColorHover()};
}

  /* Dividers in navbar */
.navbar-inverse .divider-vertical {
    border-left-color: #{vars.navbarInverseBackground()};
    border-right-color: #{vars.navbarInverseBackgroundHighlight()};
}

  /* Dropdowns */
.navbar-inverse .nav li.dropdown.open > .dropdown-toggle,
.navbar-inverse .nav li.dropdown.active > .dropdown-toggle,
.navbar-inverse .nav li.dropdown.open.active > .dropdown-toggle {
    background-color: #{vars.navbarInverseLinkBackgroundActive()};
    color: #{vars.navbarInverseLinkColorActive()};
}
.navbar-inverse .nav li.dropdown > a:hover .caret,
.navbar-inverse .nav li.dropdown > a:focus .caret {
    border-top-color: #{vars.navbarInverseLinkColorActive()};
    border-bottom-color: #{vars.navbarInverseLinkColorActive()};
}
.navbar-inverse .nav li.dropdown > .dropdown-toggle .caret {
    border-top-color: #{vars.navbarInverseLinkColor()};
    border-bottom-color: #{vars.navbarInverseLinkColor()};
}
.navbar-inverse .nav li.dropdown.open > .dropdown-toggle .caret,
.navbar-inverse .nav li.dropdown.active > .dropdown-toggle .caret,
.navbar-inverse .nav li.dropdown.open.active > .dropdown-toggle .caret {
    border-top-color: #{vars.navbarInverseLinkColorActive()};
    border-bottom-color: #{vars.navbarInverseLinkColorActive()};
}

  /* Navbar search */
.navbar-inverse .navbar-search .search-query {
      color: #{vars.white()};
      background-color: #{vars.navbarInverseSearchBackground()};
      border-color: #{vars.navbarInverseSearchBorder()};
      #{mixins.box_shadow('inset 0 1px 2px rgba(0,0,0,.1), 0 1px 0 rgba(255,255,255,.15)')}
      #{mixins.transition('none')}
}
#{mixins.placeholder('.navbar-inverse .navbar-search .search-query',
                     vars.navbarInverseSearchPlaceholderColor())}

      /* Focus states (we use .focused since IE7-8 and down doesn't support :focus) */
.navbar-inverse .navbar-search .search-query:focus,
.navbar-inverse .navbar-search .search-query.focused {
        padding: 5px 15px;
        color: #{vars.grayDark()};
        text-shadow: 0 1px 0 #{vars.white()};
        background-color: #{vars.navbarInverseSearchBackgroundFocus()};
        border: 0;
        #{mixins.box_shadow('0 0 3px rgba(0,0,0,.15)')}
        outline: 0;
}

  /* Navbar collapse button */
#{mixins.buttonBackground('.navbar-inverse .btn-navbar',
                          darken(vars.navbarInverseBackgroundHighlight(), .05), 
                          darken(vars.navbarInverseBackground(), .05)) }
";

  return rv;
};
