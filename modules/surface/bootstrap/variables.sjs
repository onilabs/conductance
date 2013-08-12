//----------------------------------------------------------------------
// port of Variables.less
// Variables to customize the look and feel of Bootstrap

var { darken, lighten, spin, add, scale } = require('../css');

//----------------------------------------------------------------------
var themes = {};

/**
   @function getTheme
   @param {optional String} [name='default'] Name of bootstrap theme to retrieve
   @summary Retrieves a bootstrap 'variables' object.
   @desc
     * If a theme with the given name isn't found, the default
     theme will be returned

     * New themes can be registered with [::registerTheme]
*/
function getTheme(name) {
  var theme;
  if (name) {
    theme = themes[name];
    if (!theme) console.log("Bootstrap theme '#{name}' not found; using default theme");
  }

  if (!theme)
    theme = themes['default'];
  return theme;
}
exports.getTheme = getTheme;


/**
   @function registerTheme
   @param {String} [name]
   @param {Object} [theme] Bootstrap 'theme' object. See [::defaultTheme].
   @summary Register a bootstrap theme object for retrieval with [::getTheme].
*/
function registerTheme(name, theme) {
  themes[name] = theme;
}
exports.registerTheme = registerTheme;

//----------------------------------------------------------------------


//----------------------------------------------------------------------

/**
   @variable bootstrapTheme
   @summary  Vanilla Twitter Bootstrap theme. Object with functions to customize the look and feel of Bootstrap (port of Variables.less)
   @desc
      You can use this as prototype for a custom theme object for registering with [::registerTheme]
*/
__js var bootstrapTheme = themes['bootstrap'] = exports.bootstrapTheme = {
  // CONDUCTANCE ENHANCEMENTS:

  // Custom Style
  // --------------------------------------------------
  customStyleDefs:  mixins -> '',



  // ------------------------------------------
  // STANDARD TWITTER BOOTSTRAP VARIABLES BELOW:

  // GLOBAL VALUES
  // --------------------------------------------------

  // Grays
  // -------------------------
  black:               -> '#000',
  grayDarker:          -> '#222',
  grayDark:            -> '#333',
  gray:                -> '#555',
  grayLight:           -> '#999',
  grayLighter:         -> '#eee',
  white:               -> '#fff',


  // Accent colors
  // -------------------------
  blue:                -> '#049cdb',
  blueDark:            -> '#0064cd',
  green:               -> '#46a546',
  red:                 -> '#9d261d',
  yellow:              -> '#ffc40d',
  orange:              -> '#f89406',
  pink:                -> '#c3325f',
  purple:              -> '#7a43b6',


  // Scaffolding
  // -------------------------
  bodyBackground:      -> this.white(),
  textColor:           -> this.grayDark(),


  // Links
  // -------------------------
  linkColor:           -> '#08c',
  linkColorHover:      -> this.linkColor() .. darken(0.15),


  // Typography
  // -------------------------
  sansFontFamily:      -> '"Helvetica Neue", Helvetica, Arial, sans-serif',
  serifFontFamily:     -> 'Georgia, "Times New Roman", Times, serif',
  monoFontFamily:      -> 'Menlo, Monaco, Consolas, "Courier New", monospace',

  baseFontSize:        -> '14px',
  baseFontFamily:      -> this.sansFontFamily(),
  baseLineHeight:      -> '20px',
  altFontFamily:       -> this.serifFontFamily(),

  headingsFontFamily:  -> 'inherit', // empty to use BS default, @baseFontFamily
  headingsFontWeight:  -> 'bold',    // instead of browser default, bold
  headingsColor:       -> 'inherit', // empty to use BS default, @textColor

  // Component sizing
  // -------------------------
  // Based on 14px font-size and 20px line-height

  fontSizeLarge:       ->  this.baseFontSize() .. scale(1.25), // ~18px
  fontSizeSmall:       ->  this.baseFontSize() .. scale(0.85), // ~12px
  fontSizeMini:        ->  this.baseFontSize() .. scale(0.75), // ~11px
  
  paddingLarge:        ->  '11px 19px', // 44px
  paddingSmall:        ->  '2px 10px',  // 26px
  paddingMini:         ->  '0 6px',   // 22px

  baseBorderRadius:    -> '4px',
  borderRadiusLarge:   -> '6px',
  borderRadiusSmall:   -> '3px',

  // Tables
  // -------------------------
  tableBackground:                 -> 'transparent', // overall background-color
  tableBackgroundAccent:           -> '#f9f9f9', // for striping
  tableBackgroundHover:            -> '#f5f5f5', // for hover
  tableBorder:                     -> '#ddd', // table and cell border


  // Buttons
  // -------------------------
  btnBackground:                     -> this.white(),
  btnBackgroundHighlight:            -> this.white() .. darken(0.1),
  btnBorder:                         -> '#ccc',
  
  btnPrimaryBackground:              -> this.linkColor(),
  btnPrimaryBackgroundHighlight:     -> this.btnPrimaryBackground() ..spin(20),
  
  btnInfoBackground:                 -> '#5bc0de',
  btnInfoBackgroundHighlight:        -> '#2f96b4',
  
  btnSuccessBackground:              -> '#62c462',
  btnSuccessBackgroundHighlight:     -> '#51a351',
  
  btnWarningBackground:              -> this.orange() .. lighten(0.15),
  btnWarningBackgroundHighlight:     -> this.orange(),
  
  btnDangerBackground:               -> '#ee5f5b',
  btnDangerBackgroundHighlight:      -> '#bd362f',
  
  btnInverseBackground:              -> '#444',
  btnInverseBackgroundHighlight:     -> this.grayDarker(),


  // Forms
  // -------------------------
  inputBackground:               -> this.white(),
  inputBorder:                   -> '#ccc',
  inputBorderRadius:             -> this.baseBorderRadius(),
  inputDisabledBackground:       -> this.grayLighter(),
  formActionsBackground:         -> '#f5f5f5',
  inputHeight:                   -> this.baseLineHeight() .. add(10), // base line-height + 8px vertical padding + 2px top/bottom border

  // Dropdowns
  // -------------------------
  dropdownBackground:            -> this.white(),
  dropdownBorder:                -> 'rgba(0,0,0,.2)',
  dropdownDividerTop:            -> '#e5e5e5',
  dropdownDividerBottom:         -> this.white(),

  dropdownLinkColor:             -> this.grayDark(),
  dropdownLinkColorHover:        -> this.white(),
  dropdownLinkColorActive:       -> this.white(),

  dropdownLinkBackgroundActive:  -> this.linkColor(),
  dropdownLinkBackgroundHover:   -> this.dropdownLinkBackgroundActive(),

  // COMPONENT VARIABLES
  // --------------------------------------------------

  // Z-index master list
  // -------------------------
  // Used for a bird's eye view of components dependent on the z-axis
  // Try to avoid customizing these :)
  zindexDropdown:          -> 1000,
  zindexPopover:           -> 1010,
  zindexTooltip:           -> 1020,
  zindexFixedNavbar:       -> 1030,
  zindexModalBackdrop:     -> 1040,
  zindexModal:             -> 1050,

  // Sprite icons path
  // -------------------------
  //@iconSpritePath:          "../img/glyphicons-halflings.png";
  //@iconWhiteSpritePath:     "../img/glyphicons-halflings-white.png";
  // in lieu of the sprite icons we use Font Awesome:

  // XXX hack note: this is relative to the bootstrap.css.gen atm, which is ugly!
  fontAwesomePath:         -> './bootstrap/fontawesome/',

  // Input placeholder text color
  // -------------------------
  placeholderText:         -> this.grayLight(),
  
  // Hr border color
  // -------------------------
  hrBorder:                -> this.grayLighter(),

  // Horizontal forms & lists
  // -------------------------
  horizontalComponentOffset:->     '180px',


  // Wells
  // -------------------------
  wellBackground:          -> '#f5f5f5',


  // Navbar
  // -------------------------
  //XXX @navbarCollapseWidth:             979px;
  //XXX @navbarCollapseDesktopWidth:      @navbarCollapseWidth + 1;

  navbarHeight:                    -> '40px',
  navbarBackgroundHighlight:       -> '#ffffff',
  navbarBackground:                -> this.navbarBackgroundHighlight() .. darken(.05),
  navbarBorder:                    -> darken(this.navbarBackground(), .12),
  
  navbarText:                      -> '#777',
  navbarLinkColor:                 -> '#777',
  navbarLinkColorHover:            -> this.grayDark(),
  navbarLinkColorActive:           -> this.gray(),
  navbarLinkBackgroundHover:       -> 'transparent',
  navbarLinkBackgroundActive:      -> this.navbarBackground() .. darken(0.05),
  
  navbarBrandColor:                -> this.navbarLinkColor(),

  // Inverted navbar
  navbarInverseBackground:         -> '#111111',
  navbarInverseBackgroundHighlight:-> '#222222',
  navbarInverseBorder:             -> '#252525',
  
  navbarInverseText:               -> this.grayLight(),
  navbarInverseLinkColor:          -> this.grayLight(),
  navbarInverseLinkColorHover:     -> this.white(),
  navbarInverseLinkColorActive:    -> this.navbarInverseLinkColorHover(),
  navbarInverseLinkBackgroundHover:-> 'transparent',
  navbarInverseLinkBackgroundActive:->this.navbarInverseBackground(),
  
  navbarInverseSearchBackground:   -> lighten(this.navbarInverseBackground, .25),
  navbarInverseSearchBackgroundFocus:->this.white(),
  navbarInverseSearchBorder:       -> this.navbarInverseBackground(),
  navbarInverseSearchPlaceholderColor:->'#ccc',

  navbarInverseBrandColor:         -> this.navbarInverseLinkColor(),

  // Pagination
  // -------------------------
  //XXX @paginationBackground:                #fff;
  //XXX @paginationBorder:                    #ddd;
  //XXX @paginationActiveBackground:          #f5f5f5;


  // Hero unit
  // -------------------------
  heroUnitBackground:              -> this.grayLighter(),
  heroUnitHeadingColor:            -> 'inherit',
  heroUnitLeadColor:               -> 'inherit',


  // Form states and alerts
  // -------------------------
  warningText:             -> '#c09853',
  warningBackground:       -> '#fcf8e3',
  warningBorder:           -> this.warningBackground() .. spin(-10) .. darken(.03),
  
  errorText:               -> '#b94a48',
  errorBackground:         -> '#f2dede',
  errorBorder:             -> this.errorBackground() .. spin(-10) .. darken(.03),
  
  successText:             -> '#468847',
  successBackground:       -> '#dff0d8',
  successBorder:           -> this.successBackground() .. spin(-10) .. darken(.05),
  
  infoText:                -> '#3a87ad',
  infoBackground:          -> '#d9edf7',
  infoBorder:              -> this.infoBackground() .. spin(-10) .. darken(.07),

  // Tooltips and popovers
  // -----------------------
  //XXX @tooltipColor:            #fff;
  //XXX @tooltipBackground:       #000;
  //XXX @tooltipArrowWidth:       5px;
  //XXX @tooltipArrowColor:       @tooltipBackground;

  popoverBackground:       -> '#fff',
  popoverArrowWidth:       -> '10px',
  popoverArrowColor:       -> '#fff',
  popoverTitleBackground:  -> this.popoverBackground() .. darken(.03),

  // Special enhancement for popovers
  popoverArrowOuterWidth:  -> this.popoverArrowWidth() .. add(1),
  popoverArrowOuterColor:  -> 'rgba(0,0,0,.25)',



  // GRID
  // --------------------------------------------------

  // Default 940px grid
  // -------------------------
  gridColumns:             -> 12,
  gridColumnWidth:         -> "60px",
  gridGutterWidth:         -> "20px",
  gridRowWidth:            -> add(scale(this.gridColumnWidth(), this.gridColumns()), 
                                  scale(this.gridGutterWidth(), this.gridColumns()-1)),

  // 1200px min
  //XXX @gridColumnWidth1200:     70px;
  //XXX @gridGutterWidth1200:     30px;
  //XXX @gridRowWidth1200:        (@gridColumns * @gridColumnWidth1200) + (@gridGutterWidth1200 * (@gridColumns - 1));
  
  // 768px-979px
  //XXX @gridColumnWidth768:      42px;
  //XXX @gridGutterWidth768:      20px;
  //XXX @gridRowWidth768:         (@gridColumns * @gridColumnWidth768) + (@gridGutterWidth768 * (@gridColumns - 1));

  // Fluid grid
  //--------------------------
  //XXX these need to go
  fluidGridColumnWidth:    -> "6.382978723%",
  fluidGridGutterWidth:    -> "2.127659574%"

  //XXX @fluidGridColumnWidth:    percentage(@gridColumnWidth/@gridRowWidth);
  //XXX @fluidGridGutterWidth:    percentage(@gridGutterWidth/@gridRowWidth);

  // 1200px min
  //XXX @fluidGridColumnWidth1200:     percentage(@gridColumnWidth1200/@gridRowWidth1200);
  //XXX @fluidGridGutterWidth1200:     percentage(@gridGutterWidth1200/@gridRowWidth1200);
  
  // 768px-979px
  //XXX @fluidGridColumnWidth768:      percentage(@gridColumnWidth768/@gridRowWidth768);
  //XXX @fluidGridGutterWidth768:      percentage(@gridGutterWidth768/@gridRowWidth768);

};


//----------------------------------------------------------------------

/**
   @variable defaultTheme
   @summary  Default Oni Labs theme. Object with functions to customize the look and feel of Bootstrap (port of Variables.less)
   @desc
      You can use this as prototype for a custom theme object for registering with [::registerTheme]
*/
__js var defaultTheme = themes['default'] = exports.defaultTheme = Object.create(bootstrapTheme); 

// see
// http://coding.smashingmagazine.com/2013/02/14/setting-weights-and-styles-at-font-face-declaration/
// for how to import fonts
// XXX hack note: local font paths are relative to bootstrap.css.gen
// atm, which is ugly
defaultTheme.customStyleDefs = mixins -> "
@global{
  /*  @import url('http://fonts.googleapis.com/css?family=Raleway:400,700'); */
  @font-face {
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 400;
    src: url('./bootstrap/fonts/Raleway/Raleway-Regular.ttf') format('truetype');
  }
  @font-face {
    font-family: 'Raleway';
    font-style: normal;
    font-weight: 700;
    src: url('./bootstrap/fonts/Raleway/Raleway-Bold.ttf') format('truetype');
  }

  /* @import url('http://fonts.googleapis.com/css?family=Droid+Sans+Mono'); */ 
  @font-face {
    font-family: 'Droid Sans Mono';
    font-style: normal;
    font-weight: 400;
    src: url('./bootstrap/fonts/Droid/DroidSansMono.ttf') format('truetype');
  }
}
";

//defaultTheme.baseFontFamily =       -> '"Raleway", sans-serif';
defaultTheme.headingsFontFamily =   -> '"Raleway", sans-serif';
defaultTheme.monoFontFamily =       -> '"Droid Sans Mono", "Courier New", monospace';

defaultTheme.headingsColor =    -> '#333';


defaultTheme.textColor =         -> '#444';
defaultTheme.white =             -> '#ffffff';
defaultTheme.baseBorderRadius =  -> '0';
defaultTheme.borderRadiusSmall = -> '0';
defaultTheme.borderRadiusLarge = -> '0';

defaultTheme.navbarHeight = -> '60px';
defaultTheme.navbarBackground =  -> '#7fc5ff';
defaultTheme.navbarBackgroundHighlight = -> '#7fc5ff';
defaultTheme.navbarBorder = -> '#7fc5ff';