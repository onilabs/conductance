//----------------------------------------------------------------------
// port of Variables.less
// Variables to customize the look and feel of Bootstrap

var { darken, lighten, spin, add, scale } = require('../css');

/**
   @variable defaultLookAndFeel
   @summary  Object with functions to customize the look and feel of Bootstrap (port of Variables.less)
   @desc
      You can use this as prototype for a custom lookAndFeel object, which can then be passed to 
      e.g. [::Container].
*/
__js var defaultLookAndFeel = exports.defaultLookAndFeel = {

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
  // XXX dropdownLinkColorActive

  // XXX dropdownLinkBackgroundActive
  dropdownLinkBackgroundHover:   -> this.linkColor(),

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
  fontAwesomePath:         -> require.url('./resources/'),

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
  //XXX @wellBackground:                  #f5f5f5;


  // Navbar
  // -------------------------
  //XXX @navbarCollapseWidth:             979px;
  //XXX @navbarCollapseDesktopWidth:      @navbarCollapseWidth + 1;

  navbarHeight:                    -> '40px',
  navbarBackgroundHighlight:       -> '#ffffff',
  navbarBackground:                -> this.navbarBackgroundHighlight() .. darken(.05),
  //XXX @navbarBorder:                    darken(@navbarBackground, 12%);
  
  navbarText:                      -> '#777',
  navbarLinkColor:                 -> '#777',
  navbarLinkColorHover:            -> this.grayDark(),
  navbarLinkColorActive:           -> this.gray(),
  navbarLinkBackgroundHover:       -> 'transparent',
  navbarLinkBackgroundActive:      -> this.navbarBackground() .. darken(0.05),
  
  navbarBrandColor:                -> this.navbarLinkColor(),

  // Inverted navbar
  //XXX @navbarInverseBackground:                #111111;
  //XXX @navbarInverseBackgroundHighlight:       #222222;
  //XXX @navbarInverseBorder:                    #252525;
  
  //XXX @navbarInverseText:                      @grayLight;
  //XXX @navbarInverseLinkColor:                 @grayLight;
  //XXX @navbarInverseLinkColorHover:            @white;
  //XXX @navbarInverseLinkColorActive:           @navbarInverseLinkColorHover;
  //XXX @navbarInverseLinkBackgroundHover:       transparent;
  //XXX @navbarInverseLinkBackgroundActive:      @navbarInverseBackground;

  // XXX these need to go
  navbarSearchBackground:          -> this.navbarBackground() .. lighten(.25),
  navbarSearchBackgroundFocus:     -> this.white(),
  navbarSearchBorder:              -> this.navbarSearchBackground() .. darken(.30),
  navbarSearchPlaceholderColor:    -> '#ccc',
  
  // XXX @navbarInverseSearchBackground:          lighten(@navbarInverseBackground, 25%);
  // XXX @navbarInverseSearchBackgroundFocus:     @white;
  // XXX @navbarInverseSearchBorder:              @navbarInverseBackground;
  // XXX @navbarInverseSearchPlaceholderColor:    #ccc;

  // XXX @navbarInverseBrandColor:                @navbarInverseLinkColor;

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
