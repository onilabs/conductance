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

  // CONDUCTANCE ENHANCEMENTS:

  // Custom Style
  // --------------------------------------------------

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


  // ------------------------------------------
  // STANDARD TWITTER BOOTSTRAP VARIABLES BELOW:

  // GLOBAL VALUES
  // --------------------------------------------------

  // Grays
  // -------------------------
defaultTheme.black =               -> '#000';
defaultTheme.grayDarker =          -> '#222';
defaultTheme.grayDark =            -> '#333';
defaultTheme.gray =                -> '#555';
defaultTheme.grayLight =           -> '#999';
defaultTheme.grayLighter =         -> '#eee';
defaultTheme.white =               -> '#fff';


  // Accent colors
  // -------------------------
defaultTheme.blue =                -> '#049cdb';
defaultTheme.blueDark =            -> '#0064cd';
defaultTheme.green =               -> '#46a546';
defaultTheme.red =                 -> '#9d261d';
defaultTheme.yellow =              -> '#ffc40d';
defaultTheme.orange =              -> '#f89406';
defaultTheme.pink =                -> '#c3325f';
defaultTheme.purple =              -> '#7a43b6';


  // Scaffolding
  // -------------------------
defaultTheme.bodyBackground =      -> this.white();
defaultTheme.textColor =           -> '#444';


  // Links
  // -------------------------
defaultTheme.linkColor =           -> '#08c';
defaultTheme.linkColorHover =      -> this.linkColor() .. darken(0.15);


  // Typography
  // -------------------------
defaultTheme.sansFontFamily =      -> '"Helvetica Neue", Helvetica, Arial, sans-serif';
defaultTheme.serifFontFamily =     -> 'Georgia, "Times New Roman", Times, serif';
defaultTheme.monoFontFamily =       -> '"Droid Sans Mono", "Courier New", monospace';

defaultTheme.baseFontSize =        -> '14px';
//defaultTheme.baseFontFamily =       -> '"Raleway", sans-serif';
defaultTheme.baseFontFamily =      -> this.sansFontFamily();
defaultTheme.baseLineHeight =      -> '20px';
defaultTheme.altFontFamily =       -> this.serifFontFamily();

defaultTheme.headingsFontFamily =   -> '"Raleway", sans-serif';

defaultTheme.headingsFontWeight =  -> 'bold';    // instead of browser default, bold
defaultTheme.headingsColor =    -> '#333';

  // Component sizing
  // -------------------------
  // Based on 14px font-size and 20px line-height

defaultTheme.fontSizeLarge =       ->  this.baseFontSize() .. scale(1.25); // ~18px
defaultTheme.fontSizeSmall =       ->  this.baseFontSize() .. scale(0.85); // ~12px
defaultTheme.fontSizeMini =        ->  this.baseFontSize() .. scale(0.75); // ~11px
  
defaultTheme.paddingLarge =        ->  '11px 19px'; // 44px
defaultTheme.paddingSmall =        ->  '2px 10px';  // 26px
defaultTheme.paddingMini =         ->  '0 6px';   // 22px

defaultTheme.baseBorderRadius =    -> '0';
defaultTheme.borderRadiusLarge =   -> '0';
defaultTheme.borderRadiusSmall =   -> '0';

  // Tables
  // -------------------------
defaultTheme.tableBackground =                 -> 'transparent'; // overall background-color
defaultTheme.tableBackgroundAccent =           -> '#f9f9f9'; // for striping
defaultTheme.tableBackgroundHover =            -> '#f5f5f5'; // for hover
defaultTheme.tableBorder =                     -> '#ddd'; // table and cell border


  // Buttons
  // -------------------------
defaultTheme.btnBackground =                     -> this.white();
defaultTheme.btnBackgroundHighlight =            -> this.white() .. darken(0.1);
defaultTheme.btnBorder =                         -> '#ccc';
  
defaultTheme.btnPrimaryBackground =              -> this.linkColor();
defaultTheme.btnPrimaryBackgroundHighlight =     -> this.btnPrimaryBackground() ..spin(20);
  
defaultTheme.btnInfoBackground =                 -> '#5bc0de';
defaultTheme.btnInfoBackgroundHighlight =        -> '#2f96b4';
  
defaultTheme.btnSuccessBackground =              -> '#62c462';
defaultTheme.btnSuccessBackgroundHighlight =     -> '#51a351';
  
defaultTheme.btnWarningBackground =              -> this.orange() .. lighten(0.15);
defaultTheme.btnWarningBackgroundHighlight =     -> this.orange();
  
defaultTheme.btnDangerBackground =               -> '#ee5f5b';
defaultTheme.btnDangerBackgroundHighlight =      -> '#bd362f';
  
defaultTheme.btnInverseBackground =              -> '#444';
defaultTheme.btnInverseBackgroundHighlight =     -> this.grayDarker();


  // Forms
  // -------------------------
defaultTheme.inputBackground =               -> this.white();
defaultTheme.inputBorder =                   -> '#ccc';
defaultTheme.inputBorderRadius =             -> this.baseBorderRadius();
defaultTheme.inputDisabledBackground =       -> this.grayLighter();
defaultTheme.formActionsBackground =         -> '#f5f5f5';
defaultTheme.inputHeight =                   -> this.baseLineHeight() .. add(10); // base line-height + 8px vertical padding + 2px top/bottom border

  // Dropdowns
  // -------------------------
defaultTheme.dropdownBackground =            -> this.white();
defaultTheme.dropdownBorder =                -> 'rgba(0,0,0,.2)';
defaultTheme.dropdownDividerTop =            -> '#e5e5e5';
defaultTheme.dropdownDividerBottom =         -> this.white();

defaultTheme.dropdownLinkColor =             -> this.grayDark();
defaultTheme.dropdownLinkColorHover =        -> this.white();
defaultTheme.dropdownLinkColorActive =       -> this.white();

defaultTheme.dropdownLinkBackgroundActive =  -> this.linkColor();
defaultTheme.dropdownLinkBackgroundHover =   -> this.dropdownLinkBackgroundActive();

  // COMPONENT VARIABLES
  // --------------------------------------------------

  // Z-index master list
  // -------------------------
  // Used for a bird's eye view of components dependent on the z-axis
  // Try to avoid customizing these :)
defaultTheme.zindexDropdown =          -> 1000;
defaultTheme.zindexPopover =           -> 1010;
defaultTheme.zindexTooltip =           -> 1020;
defaultTheme.zindexFixedNavbar =       -> 1030;
defaultTheme.zindexModalBackdrop =     -> 1040;
defaultTheme.zindexModal =             -> 1050;

  // Sprite icons path
  // -------------------------
  //@iconSpritePath:          "../img/glyphicons-halflings.png";
  //@iconWhiteSpritePath:     "../img/glyphicons-halflings-white.png";
  // in lieu of the sprite icons we use Font Awesome:

  // XXX hack note: this is relative to the bootstrap.css.gen atm, which is ugly!
defaultTheme.fontAwesomePath =         -> './bootstrap/fontawesome/';

  // Input placeholder text color
  // -------------------------
defaultTheme.placeholderText =         -> this.grayLight();
  
  // Hr border color
  // -------------------------
defaultTheme.hrBorder =                -> this.grayLighter();

  // Horizontal forms & lists
  // -------------------------
defaultTheme.horizontalComponentOffset =->     '180px';


  // Wells
  // -------------------------
defaultTheme.wellBackground =          -> '#f5f5f5';


  // Navbar
  // -------------------------
  //XXX @navbarCollapseWidth:             979px;
  //XXX @navbarCollapseDesktopWidth:      @navbarCollapseWidth + 1;

defaultTheme.navbarHeight =                    -> '60px';
defaultTheme.navbarBackgroundHighlight = -> '#7fc5ff';
defaultTheme.navbarBackground =  -> '#7fc5ff';
defaultTheme.navbarBorder = -> '#7fc5ff';
  
defaultTheme.navbarText =                      -> '#777';
defaultTheme.navbarLinkColor =                 -> '#777';
defaultTheme.navbarLinkColorHover =            -> this.grayDark();
defaultTheme.navbarLinkColorActive =           -> this.gray();
defaultTheme.navbarLinkBackgroundHover =       -> 'transparent';
defaultTheme.navbarLinkBackgroundActive =      -> this.navbarBackground() .. darken(0.05);
  
defaultTheme.navbarBrandColor =                -> this.navbarLinkColor();

  // Inverted navbar
defaultTheme.navbarInverseBackground =         -> '#111111';
defaultTheme.navbarInverseBackgroundHighlight =-> '#222222';
defaultTheme.navbarInverseBorder =             -> '#252525';
  
defaultTheme.navbarInverseText =               -> this.grayLight();
defaultTheme.navbarInverseLinkColor =          -> this.grayLight();
defaultTheme.navbarInverseLinkColorHover =     -> this.white();
defaultTheme.navbarInverseLinkColorActive =    -> this.navbarInverseLinkColorHover();
defaultTheme.navbarInverseLinkBackgroundHover =-> 'transparent';
defaultTheme.navbarInverseLinkBackgroundActive =->this.navbarInverseBackground();
  
defaultTheme.navbarInverseSearchBackground =   -> lighten(this.navbarInverseBackground, .25);
defaultTheme.navbarInverseSearchBackgroundFocus =->this.white();
defaultTheme.navbarInverseSearchBorder =       -> this.navbarInverseBackground();
defaultTheme.navbarInverseSearchPlaceholderColor =->'#ccc';

defaultTheme.navbarInverseBrandColor =         -> this.navbarInverseLinkColor();

  // Pagination
  // -------------------------
  //XXX @paginationBackground:                #fff;
  //XXX @paginationBorder:                    #ddd;
  //XXX @paginationActiveBackground:          #f5f5f5;


  // Hero unit
  // -------------------------
defaultTheme.heroUnitBackground =              -> this.grayLighter();
defaultTheme.heroUnitHeadingColor =            -> 'inherit';
defaultTheme.heroUnitLeadColor =               -> 'inherit';


  // Form states and alerts
  // -------------------------
defaultTheme.warningText =             -> '#c09853';
defaultTheme.warningBackground =       -> '#fcf8e3';
defaultTheme.warningBorder =           -> this.warningBackground() .. spin(-10) .. darken(.03);
  
defaultTheme.errorText =               -> '#b94a48';
defaultTheme.errorBackground =         -> '#f2dede';
defaultTheme.errorBorder =             -> this.errorBackground() .. spin(-10) .. darken(.03);
  
defaultTheme.successText =             -> '#468847';
defaultTheme.successBackground =       -> '#dff0d8';
defaultTheme.successBorder =           -> this.successBackground() .. spin(-10) .. darken(.05);
  
defaultTheme.infoText =                -> '#3a87ad';
defaultTheme.infoBackground =          -> '#d9edf7';
defaultTheme.infoBorder =              -> this.infoBackground() .. spin(-10) .. darken(.07);

  // Tooltips and popovers
  // -----------------------
  //XXX @tooltipColor:            #fff;
  //XXX @tooltipBackground:       #000;
  //XXX @tooltipArrowWidth:       5px;
  //XXX @tooltipArrowColor:       @tooltipBackground;

defaultTheme.popoverBackground =       -> '#fff';
defaultTheme.popoverArrowWidth =       -> '10px';
defaultTheme.popoverArrowColor =       -> '#fff';
defaultTheme.popoverTitleBackground =  -> this.popoverBackground() .. darken(.03);

  // Special enhancement for popovers
defaultTheme.popoverArrowOuterWidth =  -> this.popoverArrowWidth() .. add(1);
defaultTheme.popoverArrowOuterColor =  -> 'rgba(0,0,0,.25)';



  // GRID
  // --------------------------------------------------

  // Default 940px grid
  // -------------------------
defaultTheme.gridColumns =             -> 12;
defaultTheme.gridColumnWidth =         -> "60px";
defaultTheme.gridGutterWidth =         -> "20px";
defaultTheme.gridRowWidth =            -> add(scale(this.gridColumnWidth(), this.gridColumns()),
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
defaultTheme.fluidGridColumnWidth =    -> "6.382978723%";
defaultTheme.fluidGridGutterWidth =    -> "2.127659574%";

  //XXX @fluidGridColumnWidth:    percentage(@gridColumnWidth/@gridRowWidth);
  //XXX @fluidGridGutterWidth:    percentage(@gridGutterWidth/@gridRowWidth);

  // 1200px min
  //XXX @fluidGridColumnWidth1200:     percentage(@gridColumnWidth1200/@gridRowWidth1200);
  //XXX @fluidGridGutterWidth1200:     percentage(@gridGutterWidth1200/@gridRowWidth1200);
  
  // 768px-979px
  //XXX @fluidGridColumnWidth768:      percentage(@gridColumnWidth768/@gridRowWidth768);
  //XXX @fluidGridGutterWidth768:      percentage(@gridGutterWidth768/@gridRowWidth768);



