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


  preBackground:       -> '#f5f5f5',
  preBorder:           -> 'rgba(0,0,0,.15)',

  fontSizeH1:          -> this.baseFontSize() .. scale(2.75), // ~38px
  fontSizeH2:          -> this.baseFontSize() .. scale(2.25), // ~32px
  fontSizeH3:          -> this.baseFontSize() .. scale(1.75), // ~24px
  fontSizeH4:          -> this.baseFontSize() .. scale(1.25), // ~18px
  fontSizeH5:          -> this.baseFontSize(), 
  fontSizeH6:          -> this.baseFontSize() .. scale(0.85), // ~12px

  fontSizeH1Small:     -> this.baseFontSize() .. scale(1.75), // ~24px
  fontSizeH2Small:     -> this.baseFontSize() .. scale(1.25), // ~18px
  fontSizeH3Small:     -> this.baseFontSize(), 
  fontSizeH4Small:     -> this.baseFontSize(), 

  // inline code:
  codeColor:           -> '#d14',
  codeBackground:      -> '#f7f7f9',
  codeBorder:          -> '#e1e1e8',

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
  @import url('http://fonts.googleapis.com/css?family=Lato:300,400,700');
}";
defaultTheme.sansFontFamily =      -> '"Lato", Helvetica, Arial, sans-serif';
defaultTheme.monoFontFamily =       -> '"Droid Sans Mono", "Courier New", monospace';

defaultTheme.baseFontSize =        -> '15px';
defaultTheme.baseLineHeight =      -> '22px'; // '20px';
defaultTheme.headingsFontWeight =  -> '300';    // instead of browser default, bold

defaultTheme.textColor = -> '#555';

/*
defaultTheme.fontSizeH1=          -> this.baseFontSize() .. scale(3); // ~38px
defaultTheme.fontSizeH2=          -> this.baseFontSize() .. scale(2.45); // ~32px
defaultTheme.fontSizeH3=          -> this.baseFontSize() .. scale(1.85); // ~24px
defaultTheme.fontSizeH4=          -> this.baseFontSize() .. scale(1.45); // ~18px
defaultTheme.fontSizeH5=          -> this.baseFontSize() .. scale(1.25);
defaultTheme.fontSizeH6=          -> this.baseFontSize(); // ~12px
*/

defaultTheme.headingsFontFamily = -> "'Lato', sans-serif";

defaultTheme.navbarInverseBackground =         -> '#a31317';
defaultTheme.navbarInverseBackgroundHighlight =-> '#c4161c';
defaultTheme.navbarInverseBorder =             -> '#c4161c';
  
defaultTheme.navbarInverseText =               -> this.white();
defaultTheme.navbarInverseLinkColor =          -> this.white();
defaultTheme.navbarInverseLinkColorHover =     -> this.white();

defaultTheme.hrBorder =                -> '#c4161c';

defaultTheme.headingsColor =    -> '#444';

//defaultTheme.linkColor =           -> '#c4161c'; // '#08c';

defaultTheme.navbarHeight =                    -> '60px';

defaultTheme.baseBorderRadius =    -> '3px';
defaultTheme.borderRadiusLarge =   -> '4px';
defaultTheme.borderRadiusSmall =   -> '2px';


__js var jasonTheme = themes['jason'] = exports.jasonTheme = Object.create(bootstrapTheme); 

  // CONDUCTANCE ENHANCEMENTS:

  // Custom Style
  // --------------------------------------------------

// see
// http://coding.smashingmagazine.com/2013/02/14/setting-weights-and-styles-at-font-face-declaration/
// for how to import fonts
// XXX hack note: local font paths are relative to bootstrap.css.gen
// atm, which is ugly
jasonTheme.customStyleDefs = mixins -> "
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


jasonTheme.preBackground =       -> '#fcfcfc'; // '#f5f5f5';
jasonTheme.preBorder =           -> 'rgba(0,0,0,0.15)'; //'rgba(0,0,0,.15)';

jasonTheme.fontSizeH1 =          -> this.baseFontSize() .. scale(2.5); // ~38px // 2.75 ~40px
jasonTheme.fontSizeH2 =          -> this.baseFontSize() .. scale(2); // ~32px	//
jasonTheme.fontSizeH3 =          -> this.baseFontSize() .. scale(1.5); // ~24px
jasonTheme.fontSizeH4 =          -> this.baseFontSize() .. scale(1.25); // ~18px
jasonTheme.fontSizeH5 =          -> this.baseFontSize();
jasonTheme.fontSizeH6 =          -> this.baseFontSize() .. scale(0.85); // ~12px

jasonTheme.fontSizeH1Small =     -> this.baseFontSize() .. scale(1.75); // ~24px
jasonTheme.fontSizeH2Small =     -> this.baseFontSize() .. scale(1.25); // ~18px
jasonTheme.fontSizeH3Small =     -> this.baseFontSize();
jasonTheme.fontSizeH4Small =     -> this.baseFontSize();

  // inline code:
jasonTheme.codeColor =           -> '#333'; // '#d14';
jasonTheme.codeBackground =      -> '#fff'; // '#f7f7f9';
jasonTheme.codeBorder =          -> '#ccc'; //'#e1e1e8';


  // ------------------------------------------
  // STANDARD TWITTER BOOTSTRAP VARIABLES BELOW:

  // GLOBAL VALUES
  // --------------------------------------------------

  // Grays
  // -------------------------
jasonTheme.black =               -> '#000';
jasonTheme.grayDarker =          -> '#222';
jasonTheme.grayDark =            -> '#333';
jasonTheme.gray =                -> '#555';
jasonTheme.grayLight =           -> '#999';
jasonTheme.grayLighter =         -> '#eee';
jasonTheme.white =               -> '#fff';


  // Accent colors
  // -------------------------
jasonTheme.blue =                -> '#049cdb';
jasonTheme.blueDark =            -> '#0064cd';
jasonTheme.green =               -> '#46a546';
jasonTheme.red =                 -> '#fc474e'; // '#9d261d';
jasonTheme.yellow =              -> '#ffc40d';
jasonTheme.orange =              -> '#f89406';
jasonTheme.pink =                -> '#c3325f';
jasonTheme.purple =              -> '#7a43b6';


  // Scaffolding
  // -------------------------
jasonTheme.bodyBackground =      -> this.white(); // this.white();
jasonTheme.textColor =           -> '#444';


  // Links
  // -------------------------
jasonTheme.linkColor =           -> '#389aed'; // '#08c';
jasonTheme.linkColorHover =      -> this.linkColor() .. darken(0.15); // this.linkColor() .. darken(0.15);


  // Typography
  // -------------------------
jasonTheme.sansFontFamily =      -> '"Helvetica Neue", Helvetica, Arial, sans-serif';
jasonTheme.serifFontFamily =     -> 'Georgia, "Times New Roman", Times, serif';
jasonTheme.monoFontFamily =       -> '"Droid Sans Mono", "Courier New", monospace';

jasonTheme.baseFontSize =        -> '14px'; // '14px';
//jasonTheme.baseFontFamily =       -> '"Raleway", sans-serif';
jasonTheme.baseFontFamily =      -> this.sansFontFamily();
jasonTheme.baseLineHeight =      -> '24px'; // '20px';
jasonTheme.altFontFamily =       -> this.serifFontFamily();

jasonTheme.headingsFontFamily =   -> '"Raleway", sans-serif';

jasonTheme.headingsFontWeight =  -> 'bold';    // instead of browser default, bold
jasonTheme.headingsColor =    -> '#333';

  // Component sizing
  // -------------------------
  // Based on 14px font-size and 20px line-height

jasonTheme.fontSizeLarge =       ->  this.baseFontSize() .. scale(1.25); // ~18px
jasonTheme.fontSizeSmall =       ->  this.baseFontSize() .. scale(0.85); // ~12px
jasonTheme.fontSizeMini =        ->  this.baseFontSize() .. scale(0.75); // ~11px
  
jasonTheme.paddingLarge =        ->  '11px 19px'; // 44px
jasonTheme.paddingSmall =        ->  '2px 10px';  // 26px
jasonTheme.paddingMini =         ->  '0 6px';   // 22px

jasonTheme.baseBorderRadius =    -> '0';
jasonTheme.borderRadiusLarge =   -> '0';
jasonTheme.borderRadiusSmall =   -> '0';

  // Tables
  // -------------------------
jasonTheme.tableBackground =                 -> 'transparent'; // overall background-color
jasonTheme.tableBackgroundAccent =           -> '#f9f9f9'; // for striping
jasonTheme.tableBackgroundHover =            -> '#f5f5f5'; // for hover
jasonTheme.tableBorder =                     -> '#ddd'; // table and cell border


  // Buttons
  // -------------------------
jasonTheme.btnBackground =                     -> this.white();
jasonTheme.btnBackgroundHighlight =            -> this.white() .. darken(0.1);
jasonTheme.btnBorder =                         -> '#ccc';
  
jasonTheme.btnPrimaryBackground =              -> this.linkColor();
jasonTheme.btnPrimaryBackgroundHighlight =     -> this.btnPrimaryBackground() ..spin(20);
  
jasonTheme.btnInfoBackground =                 -> '#5bc0de';
jasonTheme.btnInfoBackgroundHighlight =        -> '#2f96b4';
  
jasonTheme.btnSuccessBackground =              -> '#62c462';
jasonTheme.btnSuccessBackgroundHighlight =     -> '#51a351';
  
jasonTheme.btnWarningBackground =              -> this.orange() .. lighten(0.15);
jasonTheme.btnWarningBackgroundHighlight =     -> this.orange();
  
jasonTheme.btnDangerBackground =               -> '#ee5f5b';
jasonTheme.btnDangerBackgroundHighlight =      -> '#bd362f';
  
jasonTheme.btnInverseBackground =              -> '#444';
jasonTheme.btnInverseBackgroundHighlight =     -> this.grayDarker();


  // Forms
  // -------------------------
jasonTheme.inputBackground =               -> this.white();
jasonTheme.inputBorder =                   -> '#ccc';
jasonTheme.inputBorderRadius =             -> this.baseBorderRadius();
jasonTheme.inputDisabledBackground =       -> this.grayLighter();
jasonTheme.formActionsBackground =         -> '#f5f5f5';
jasonTheme.inputHeight =                   -> this.baseLineHeight() .. add(10); // base line-height + 8px vertical padding + 2px top/bottom border

  // Dropdowns
  // -------------------------
jasonTheme.dropdownBackground =            -> this.white();
jasonTheme.dropdownBorder =                -> 'rgba(0,0,0,.2)';
jasonTheme.dropdownDividerTop =            -> '#e5e5e5';
jasonTheme.dropdownDividerBottom =         -> this.white();

jasonTheme.dropdownLinkColor =             -> this.grayDark();
jasonTheme.dropdownLinkColorHover =        -> this.white();
jasonTheme.dropdownLinkColorActive =       -> this.white();

jasonTheme.dropdownLinkBackgroundActive =  -> this.linkColor();
jasonTheme.dropdownLinkBackgroundHover =   -> this.dropdownLinkBackgroundActive();

  // COMPONENT VARIABLES
  // --------------------------------------------------

  // Z-index master list
  // -------------------------
  // Used for a bird's eye view of components dependent on the z-axis
  // Try to avoid customizing these :)
jasonTheme.zindexDropdown =          -> 1000;
jasonTheme.zindexPopover =           -> 1010;
jasonTheme.zindexTooltip =           -> 1020;
jasonTheme.zindexFixedNavbar =       -> 1030;
jasonTheme.zindexModalBackdrop =     -> 1040;
jasonTheme.zindexModal =             -> 1050;

  // Sprite icons path
  // -------------------------
  //@iconSpritePath:          "../img/glyphicons-halflings.png";
  //@iconWhiteSpritePath:     "../img/glyphicons-halflings-white.png";
  // in lieu of the sprite icons we use Font Awesome:

  // XXX hack note: this is relative to the bootstrap.css.gen atm, which is ugly!
jasonTheme.fontAwesomePath =         -> './bootstrap/fontawesome/';

  // Input placeholder text color
  // -------------------------
jasonTheme.placeholderText =         -> this.grayLight();
  
  // Hr border color
  // -------------------------
jasonTheme.hrBorder =                -> this.grayLighter();

  // Horizontal forms & lists
  // -------------------------
jasonTheme.horizontalComponentOffset =->     '180px';


  // Wells
  // -------------------------
jasonTheme.wellBackground =          -> '#f5f5f5';


  // Navbar
  // -------------------------
  //XXX @navbarCollapseWidth:             979px;
  //XXX @navbarCollapseDesktopWidth:      @navbarCollapseWidth + 1;

jasonTheme.navbarHeight =                    -> '60px';
jasonTheme.navbarBackgroundHighlight = -> '#7fc5ff';
jasonTheme.navbarBackground =  -> '#7fc5ff';
jasonTheme.navbarBorder = -> '#7fc5ff';
  
jasonTheme.navbarText =                      -> '#777';
jasonTheme.navbarLinkColor =                 -> '#777';
jasonTheme.navbarLinkColorHover =            -> this.grayDark();
jasonTheme.navbarLinkColorActive =           -> this.gray();
jasonTheme.navbarLinkBackgroundHover =       -> 'transparent';
jasonTheme.navbarLinkBackgroundActive =      -> this.navbarBackground() .. darken(0.05);
  
jasonTheme.navbarBrandColor =                -> this.navbarLinkColor();

  // Inverted navbar
jasonTheme.navbarInverseBackground =         -> '#111111';
jasonTheme.navbarInverseBackgroundHighlight =-> '#222222';
jasonTheme.navbarInverseBorder =             -> '#252525';
  
jasonTheme.navbarInverseText =               -> this.grayLight();
jasonTheme.navbarInverseLinkColor =          -> this.grayLight();
jasonTheme.navbarInverseLinkColorHover =     -> this.white();
jasonTheme.navbarInverseLinkColorActive =    -> this.navbarInverseLinkColorHover();
jasonTheme.navbarInverseLinkBackgroundHover =-> 'transparent';
jasonTheme.navbarInverseLinkBackgroundActive =->this.navbarInverseBackground();
  
jasonTheme.navbarInverseSearchBackground =   -> lighten(this.navbarInverseBackground, .25);
jasonTheme.navbarInverseSearchBackgroundFocus =->this.white();
jasonTheme.navbarInverseSearchBorder =       -> this.navbarInverseBackground();
jasonTheme.navbarInverseSearchPlaceholderColor =->'#ccc';

jasonTheme.navbarInverseBrandColor =         -> this.navbarInverseLinkColor();

  // Pagination
  // -------------------------
  //XXX @paginationBackground:                #fff;
  //XXX @paginationBorder:                    #ddd;
  //XXX @paginationActiveBackground:          #f5f5f5;


  // Hero unit
  // -------------------------
jasonTheme.heroUnitBackground =              -> this.grayLighter();
jasonTheme.heroUnitHeadingColor =            -> 'inherit';
jasonTheme.heroUnitLeadColor =               -> 'inherit';


  // Form states and alerts
  // -------------------------
jasonTheme.warningText =             -> '#c09853';
jasonTheme.warningBackground =       -> '#fcf8e3';
jasonTheme.warningBorder =           -> this.warningBackground() .. spin(-10) .. darken(.03);
  
jasonTheme.errorText =               -> '#b94a48';
jasonTheme.errorBackground =         -> '#f2dede';
jasonTheme.errorBorder =             -> this.errorBackground() .. spin(-10) .. darken(.03);
  
jasonTheme.successText =             -> '#468847';
jasonTheme.successBackground =       -> '#dff0d8';
jasonTheme.successBorder =           -> this.successBackground() .. spin(-10) .. darken(.05);
  
jasonTheme.infoText =                -> '#3a87ad';
jasonTheme.infoBackground =          -> '#d9edf7';
jasonTheme.infoBorder =              -> this.infoBackground() .. spin(-10) .. darken(.07);

  // Tooltips and popovers
  // -----------------------
  //XXX @tooltipColor:            #fff;
  //XXX @tooltipBackground:       #000;
  //XXX @tooltipArrowWidth:       5px;
  //XXX @tooltipArrowColor:       @tooltipBackground;

jasonTheme.popoverBackground =       -> '#fff';
jasonTheme.popoverArrowWidth =       -> '10px';
jasonTheme.popoverArrowColor =       -> '#fff';
jasonTheme.popoverTitleBackground =  -> this.popoverBackground() .. darken(.03);

  // Special enhancement for popovers
jasonTheme.popoverArrowOuterWidth =  -> this.popoverArrowWidth() .. add(1);
jasonTheme.popoverArrowOuterColor =  -> 'rgba(0,0,0,.25)';



  // GRID
  // --------------------------------------------------

  // Default 940px grid
  // -------------------------
jasonTheme.gridColumns =             -> 12;
jasonTheme.gridColumnWidth =         -> "60px";
jasonTheme.gridGutterWidth =         -> "20px";
jasonTheme.gridRowWidth =            -> add(scale(this.gridColumnWidth(), this.gridColumns()),
                                  scale(this.gridGutterWidth(), this.gridColumns()-1));

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
jasonTheme.fluidGridColumnWidth =    -> "6.382978723%";
jasonTheme.fluidGridGutterWidth =    -> "2.127659574%";

  //XXX @fluidGridColumnWidth:    percentage(@gridColumnWidth/@gridRowWidth);
  //XXX @fluidGridGutterWidth:    percentage(@gridGutterWidth/@gridRowWidth);

  // 1200px min
  //XXX @fluidGridColumnWidth1200:     percentage(@gridColumnWidth1200/@gridRowWidth1200);
  //XXX @fluidGridGutterWidth1200:     percentage(@gridGutterWidth1200/@gridRowWidth1200);
  
  // 768px-979px
  //XXX @fluidGridColumnWidth768:      percentage(@gridColumnWidth768/@gridRowWidth768);
  //XXX @fluidGridGutterWidth768:      percentage(@gridGutterWidth768/@gridRowWidth768);



