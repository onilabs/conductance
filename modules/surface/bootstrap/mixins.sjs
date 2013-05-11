//----------------------------------------------------------------------
// port of mixins.less
// Snippets of reusable CSS to develop faster and keep code readable

var { darken, lighten, spin, add, scale, fadein, mix } = require('../css');

__js var Mixins = exports.Mixins = function(vars) {
  var mixins = {
    
    // UTILITY MIXINS
    // --------------------------------------------------

    // Clearfix
    // --------
    // For clearing floats like a boss h5bp.com/q
    clearfix: selector -> 
      "#{selector} { *zoom: 1; }
       #{selector}:before,
       #{selector}:after {
            display: table;
            content: '';
            /* Fixes Opera/contenteditable bug: */
            /* http://nicolasgallagher.com/micro-clearfix-hack/#comment-36952 */
            line-height: 0;
       }
       #{selector}:after {
            clear: both;
       }"
    ,

    // Webkit-style focus
    // ------------------
    tab_focus: ->
      "/* Default */
       outline: thin dotted #333;
       /* Webkit */
       outline: 5px auto -webkit-focus-ring-color;
       outline-offset: -2px;"
    ,

    // Center-align a block level element
    // ----------------------------------
    center_block: ->
      "display: block;
       margin-left: auto;
       margin-right: auto;"
    ,

    // IE7 inline-block
    // ----------------
    ie7_inline_block: ->
      "*display: inline; /* IE7 inline-block hack */
       *zoom: 1;"
    ,

    // IE7 likes to collapse whitespace on either side of the inline-block elements.
    // Ems because we're attempting to match the width of a space character. Left
    // version is for form buttons, which typically come after other elements, and
    // right version is for icons, which come before. Applying both is ok, but it will
    // mean that space between those elements will be .6em (~2 space characters) in IE7,
    // instead of the 1 space in other browsers.
    ie7_restore_left_whitespace: selector -> 
      "#{selector} { *margin-left: .3em; }
       #{selector}:first-child { *margin-left: 0; }"
    ,

    ie7_restore_right_whitespace: ->
      "*margin-right: .3em;"
    ,

    // Sizing shortcuts
    // -------------------------
      /*XXX .size(@height, @width) {
        width: @width;
        height: @height;
        }
        .square(@size) {
        .size(@size, @size);
        }
        */

    // Placeholder text
    // -------------------------
    placeholder: function(selector, color) {
      color = color || vars.placeholderText();
      return "#{selector}:-moz-placeholder {
                color: #{color};
              }
              #{selector}:-ms-input-placeholder {
                color: #{color};
              }
              #{selector}::-webkit-input-placeholder {
                color: #{color};
              }";
    },

    // Text overflow
    // -------------------------
    // Requires inline-block or block for proper styling
    text_overflow: ->  
      "overflow: hidden;
       text-overflow: ellipsis;
       white-space: nowrap;" 
    ,

    // CSS image replacement
    // -------------------------
    // Source: https://github.com/h5bp/html5-boilerplate/commit/aa0396eae757
      /* XXX .hide-text {
        font: 0/0 a;
        color: transparent;
        text-shadow: none;
        background-color: transparent;
        border: 0;
      }
      */

    // FONTS
    // --------------------------------------------------

    font : {
      family : {
        serif: -> "font-family: #{vars.serifFontFamily()};",
        sans_serif: -> "font-family: #{vars.sansFontFamily()};",
        monospace: ->"font-family: #{vars.monoFontFamily()};"
      },
  
      shorthand: (size,weight,lineHeight) ->
        "font-size:   #{size||vars.baseFontSize()};
         font-weight: #{weight||'normal'};
         line-height: #{lineHeight||vars.baseLineHeight()};"
      ,
      serif: (size, weight, lineHeight) ->
        "#{this.family.serif()}
         #{this.shorthand(size, weight, lineHeight)}"
      ,
      sans_serif: (size, weight, lineHeight) ->
        "#{this.family.sans_serif()}
         #{this.shorthand(size, weight, lineHeight)}"
      ,
      monospace: (size, weight, lineHeight) ->
        "#{this.family.monospace()}
         #{this.shorthand(size, weight, lineHeight)}"
    },

    // FORMS
    // --------------------------------------------------

    // Block level inputs
    input_block_level: ->
        "display: block;
         width: 100%;
         min-height: #{vars.inputHeight()};        /* Make inputs at least the height of their button counterpart (base line-height + padding + border) */
         #{this.box_sizing('border-box')}; /* Makes inputs behave like true block-level elements */
        "
    ,

    // Mixin for form field states
    formFieldState: function(selector, textColor, borderColor, backgroundColor) {
      textColor = textColor || '#555';
      borderColor = borderColor || '#ccc';
      backgroundColor = backgroundColor || '#f5f5f5';

      return "
       /* Set the text color */
       #{selector} .control-label,
       #{selector} .help-block,
       #{selector} .help-inline {
          color: #{textColor};
        }
       /* Style inputs accordingly */
       #{selector} .checkbox,
       #{selector} .radio,
       #{selector} input,
       #{selector} select,
       #{selector} textarea {
        color: #{textColor};
       }
       #{selector} input,
       #{selector} select,
       #{selector} textarea {
        border-color: #{borderColor};
        #{this.box_shadow('inset 0 1px 1px rgba(0,0,0,.075)')} /* Redeclare so transitions work */
       }
       #{selector} input:focus,
       #{selector} select:focus,
       #{selector} textarea:focus {
            border-color: #{darken(borderColor, .1)};
            #{this.box_shadow('inset 0 1px 1px rgba(0,0,0,.075), 0 0 6px '+lighten(borderColor, .2))}
       }
       /* Give a small background color for input-prepend/-append */
       #{selector} .input-prepend .add-on,
       #{selector} .input-append .add-on {
          color: #{textColor};
          background-color: #{backgroundColor};
          border-color: #{textColor};
       }";
    },

    // CSS3 PROPERTIES
    // --------------------------------------------------

    // Border Radius
    border_radius: radius ->
      "-webkit-border-radius: #{radius};
          -moz-border-radius: #{radius};
               border-radius: #{radius};"
    ,
    // Single Corner Border Radius
    border_top_left_radius: radius -> 
      "-webkit-border-top-left-radius: #{radius};
           -moz-border-radius-topleft: #{radius};
               border-top-left-radius: #{radius};"
    ,

    border_top_right_radius: radius ->
      "-webkit-border-top-right-radius: #{radius};
           -moz-border-radius-topright: #{radius};
               border-top-right-radius: #{radius};"
    ,

    border_bottom_right_radius: radius -> 
      "-webkit-border-bottom-right-radius: #{radius};
           -moz-border-radius-bottomright: #{radius};
               border-bottom-right-radius: #{radius};"
    ,
    border_bottom_left_radius: radius ->
      "-webkit-border-bottom-left-radius: #{radius};
           -moz-border-radius-bottomleft: #{radius};
               border-bottom-left-radius: #{radius};"
    ,

    // Single Side Border Radius
    border_top_radius: radius ->
      "#{border_top_right_radius(radius)}
       #{border_top_left_radius(radius)}"
    ,
    border_right_radius: radius ->
      "#{border_top_right_radius(radius)}
       #{border_bottom_right_radius(radius)}"
    ,
    border_bottom_radius: radius ->
      "#{border_bottom_right_radius(radius)}
       #{border_bottom_left_radius(radius)}"
    ,
    border_left_radius: radius ->
      "#{border_top_left_radius(radius)}
       #{border_bottom_left_radius(radius)}"
    ,

    // Drop shadows
    box_shadow: shadow ->
      "-webkit-box-shadow: #{shadow};
       -moz-box-shadow: #{shadow};
       box-shadow: #{shadow};"
    ,

    // Transitions
    transition: transition ->
      "-webkit-transition: #{transition};
       -moz-transition: #{transition};
       -ms-transition: #{transition};
       -o-transition: #{transition};
       transition: #{transition};"
    ,

/* XXX
.transition-delay(@transition-delay) {
  -webkit-transition-delay: @transition-delay;
     -moz-transition-delay: @transition-delay;
       -o-transition-delay: @transition-delay;
          transition-delay: @transition-delay;
}
.transition-duration(@transition-duration) {
  -webkit-transition-duration: @transition-duration;
     -moz-transition-duration: @transition-duration;
       -o-transition-duration: @transition-duration;
          transition-duration: @transition-duration;
}

// Transformations
.rotate(@degrees) {
  -webkit-transform: rotate(@degrees);
     -moz-transform: rotate(@degrees);
      -ms-transform: rotate(@degrees);
       -o-transform: rotate(@degrees);
          transform: rotate(@degrees);
}
.scale(@ratio) {
  -webkit-transform: scale(@ratio);
     -moz-transform: scale(@ratio);
      -ms-transform: scale(@ratio);
       -o-transform: scale(@ratio);
          transform: scale(@ratio);
}
.translate(@x, @y) {
  -webkit-transform: translate(@x, @y);
     -moz-transform: translate(@x, @y);
      -ms-transform: translate(@x, @y);
       -o-transform: translate(@x, @y);
          transform: translate(@x, @y);
}
.skew(@x, @y) {
  -webkit-transform: skew(@x, @y);
     -moz-transform: skew(@x, @y);
      -ms-transform: skewX(@x) skewY(@y); // See https://github.com/twitter/bootstrap/issues/4885
       -o-transform: skew(@x, @y);
          transform: skew(@x, @y);
  -webkit-backface-visibility: hidden; // See https://github.com/twitter/bootstrap/issues/5319
}
.translate3d(@x, @y, @z) {
  -webkit-transform: translate3d(@x, @y, @z);
     -moz-transform: translate3d(@x, @y, @z);
       -o-transform: translate3d(@x, @y, @z);
          transform: translate3d(@x, @y, @z);
}

// Backface visibility
// Prevent browsers from flickering when using CSS 3D transforms.
// Default value is `visible`, but can be changed to `hidden
// See git pull https://github.com/dannykeane/bootstrap.git backface-visibility for examples
.backface-visibility(@visibility){
	-webkit-backface-visibility: @visibility;
	   -moz-backface-visibility: @visibility;
	        backface-visibility: @visibility;
}
*/

    // Background clipping
    // Heads up: FF 3.6 and under need "padding" instead of "padding-box"
    background_clip: clip ->
      "-webkit-background-clip: #{clip};
       -moz-background-clip: #{clip};
       background-clip: #{clip};"
    ,

    // Background sizing
    background_size: size ->
      "-webkit-background-size: #{size};
       -moz-background-size: #{size};
       -o-background-size: #{size};
       background-size: #{size};"
    ,

    // Box sizing
    box_sizing: boxmodel ->
      "-webkit-box-sizing: #{boxmodel};
       -moz-box-sizing: #{boxmodel};
       box-sizing: #{boxmodel};"
    ,

    // User select
    // For selecting text on the page
    user_select: select ->
        "-webkit-user-select: #{select};
            -moz-user-select: #{select};
             -ms-user-select: #{select};
              -o-user-select: #{select};
                  user-select: #{select};"
    ,

/* XXX
// Resize anything
.resizable(@direction) {
  resize: @direction; // Options: horizontal, vertical, both
  overflow: auto; // Safari fix
}

// CSS3 Content Columns
.content-columns(@columnCount, @columnGap: @gridGutterWidth) {
  -webkit-column-count: @columnCount;
     -moz-column-count: @columnCount;
          column-count: @columnCount;
  -webkit-column-gap: @columnGap;
     -moz-column-gap: @columnGap;
          column-gap: @columnGap;
}

// Optional hyphenation
.hyphens(@mode: auto) {
  word-wrap: break-word;
  -webkit-hyphens: @mode;
     -moz-hyphens: @mode;
      -ms-hyphens: @mode;
       -o-hyphens: @mode;
          hyphens: @mode;
}
*/    
    // Opacity
    opacity: opacity ->
      "opacity: #{Math.round(opacity*100)/10000};
       filter: alpha(opacity=#{opacity});"
    ,

    // BACKGROUNDS
    // --------------------------------------------------
/* XXX
// Add an alphatransparency value to any background or border color (via Elyse Holladay)
#translucent {
  .background(@color: @white, @alpha: 1) {
    background-color: hsla(hue(@color), saturation(@color), lightness(@color), @alpha);
  }
  .border(@color: @white, @alpha: 1) {
    border-color: hsla(hue(@color), saturation(@color), lightness(@color), @alpha);
    .background-clip(padding-box);
  }
}
*/

    // Gradient Bar Colors for buttons and alerts
    gradientBar: (primaryColor, secondaryColor, textColor, textShadow) ->
     "color: #{textColor||'#fff'};
      text-shadow: #{textShadow||'0 -1px 0 rgba(0,0,0,.25)'};
      #{this.gradient.vertical(primaryColor, secondaryColor)}
      border-color: #{secondaryColor} #{secondaryColor} #{darken(secondaryColor, .15)};
      border-color: rgba(0,0,0,.1) rgba(0,0,0,.1) #{fadein('rgba(0,0,0,.1)', .15)};"
    ,

    // Gradients
    gradient : {
      horizontal: function(startColor, endColor) {
        startColor = startColor || '#555';
        endColor = endColor || '#333';
        return "
         background-color: #{endColor};
         background-image: -moz-linear-gradient(left, #{startColor}, #{endColor}); /* FF 3.6+ */
         background-image: -webkit-gradient(linear, 0 0, 100% 0, from(#{startColor}), to(#{endColor})); /* Safari 4+, Chrome 2+ */
         background-image: -webkit-linear-gradient(left, #{startColor}, #{endColor}); /* Safari 5.1+, Chrome 10+ */
         background-image: -o-linear-gradient(left, #{startColor}, #{endColor}); /* Opera 11.10 */
         background-image: linear-gradient(left, #{startColor}, #{endColor}); /* Le standard */
         background-repeat: repeat-x;
         filter: e(%(\"progid:DXImageTransform.Microsoft.gradient(startColorstr='%d', endColorstr='%d', GradientType=1)\",#{startColor},#{endColor})); /* IE9 and down */"
      },
      vertical: function(startColor, endColor) {
        startColor = startColor || '#555';
        endColor = endColor || '#333';
        return "
         background-color: #{mix(startColor, endColor, .6)};
         background-image: -moz-linear-gradient(top, #{startColor}, #{endColor}); /* FF 3.6+ */
         background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#{startColor}), to(#{endColor})); /* Safari 4+, Chrome 2+ */
         background-image: -webkit-linear-gradient(top, #{startColor}, #{endColor}); /* Safari 5.1+, Chrome 10+ */
         background-image: -o-linear-gradient(top, #{startColor}, #{endColor}); /* Opera 11.10 */
         background-image: linear-gradient(top, #{startColor}, #{endColor}); /* The standard */
         background-repeat: repeat-x;
         filter: e(%(\"progid:DXImageTransform.Microsoft.gradient(startColorstr='%d', endColorstr='%d', GradientType=0)\",#{startColor},#{endColor})); /* IE9 and down */"
      },
      /* XXX
  .directional(@startColor: #555, @endColor: #333, @deg: 45deg) {
    background-color: @endColor;
    background-repeat: repeat-x;
    background-image: -moz-linear-gradient(@deg, @startColor, @endColor); // FF 3.6+
    background-image: -webkit-linear-gradient(@deg, @startColor, @endColor); // Safari 5.1+, Chrome 10+
    background-image: -o-linear-gradient(@deg, @startColor, @endColor); // Opera 11.10
    background-image: linear-gradient(@deg, @startColor, @endColor); // Standard, IE10
  }
  .horizontal-three-colors(@startColor: #00b3ee, @midColor: #7a43b6, @colorStop: 50%, @endColor: #c3325f) {
    background-color: mix(@midColor, @endColor, 80%);
    background-image: -webkit-gradient(left, linear, 0 0, 0 100%, from(@startColor), color-stop(@colorStop, @midColor), to(@endColor));
    background-image: -webkit-linear-gradient(left, @startColor, @midColor @colorStop, @endColor);
    background-image: -moz-linear-gradient(left, @startColor, @midColor @colorStop, @endColor);
    background-image: -o-linear-gradient(left, @startColor, @midColor @colorStop, @endColor);
    background-image: linear-gradient(to right, @startColor, @midColor @colorStop, @endColor);
    background-repeat: no-repeat;
    filter: e(%("progid:DXImageTransform.Microsoft.gradient(startColorstr='%d', endColorstr='%d', GradientType=0)",argb(@startColor),argb(@endColor))); // IE9 and down, gets no color-stop at all for proper fallback
  }

  .vertical-three-colors(@startColor: #00b3ee, @midColor: #7a43b6, @colorStop: 50%, @endColor: #c3325f) {
    background-color: mix(@midColor, @endColor, 80%);
    background-image: -webkit-gradient(linear, 0 0, 0 100%, from(@startColor), color-stop(@colorStop, @midColor), to(@endColor));
    background-image: -webkit-linear-gradient(@startColor, @midColor @colorStop, @endColor);
    background-image: -moz-linear-gradient(top, @startColor, @midColor @colorStop, @endColor);
    background-image: -o-linear-gradient(@startColor, @midColor @colorStop, @endColor);
    background-image: linear-gradient(@startColor, @midColor @colorStop, @endColor);
    background-repeat: no-repeat;
    filter: e(%("progid:DXImageTransform.Microsoft.gradient(startColorstr='%d', endColorstr='%d', GradientType=0)",argb(@startColor),argb(@endColor))); // IE9 and down, gets no color-stop at all for proper fallback
  }
  .radial(@innerColor: #555, @outerColor: #333) {
    background-color: @outerColor;
    background-image: -webkit-gradient(radial, center center, 0, center center, 460, from(@innerColor), to(@outerColor));
    background-image: -webkit-radial-gradient(circle, @innerColor, @outerColor);
    background-image: -moz-radial-gradient(circle, @innerColor, @outerColor);
    background-image: -o-radial-gradient(circle, @innerColor, @outerColor);
    background-repeat: no-repeat;
  }
*/

      striped: function(color, angle) {
        color = color || '#555';
        angle = angle || '-45deg';
        return "
         background-color: #{color};
         background-image: -webkit-gradient(linear, 0 100%, 100% 0, color-stop(.25, rgba(255,255,255,.15)), color-stop(.25, transparent), color-stop(.5, transparent), color-stop(.5, rgba(255,255,255,.15)), color-stop(.75, rgba(255,255,255,.15)), color-stop(.75, transparent), to(transparent));
         background-image: -webkit-linear-gradient(#{angle}, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
         background-image: -moz-linear-gradient(#{angle}, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
         background-image: -o-linear-gradient(#{angle}, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);
         background-image: linear-gradient(#{angle}, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent);"
      }
    },

    // Reset filters for IE
    reset_filter: ->
      "filter: e(%(\"progid:DXImageTransform.Microsoft.gradient(enabled = false)\"));"
    ,

    // COMPONENT MIXINS
    // --------------------------------------------------

    // Horizontal dividers
    // -------------------------
    // Dividers (basically an hr) within dropdowns and nav lists
    nav_divider: function(top, bottom) {
      top = top || '#e5e5e5';
      bottom = bottom || vars.white();
      return "
       /* IE7 needs a set width since we gave a height. Restricting just */
       /* to IE7 to keep the 1px left/right space in other browsers. */
       /* It is unclear where IE is getting the extra space that we need */
       /* to negative-margin away, but so it goes. */
       *width: 100%;
       height: 1px;
       margin: #{add(scale(vars.baseLineHeight(), 1/2), -1)} 1px; /* 8px 1px */
       *margin: -5px 0 5px;
       overflow: hidden;
       background-color: #{top};
       border-bottom: 1px solid #{bottom};"
    },

    // Button backgrounds
    // ------------------
    buttonBackground: function(selector, startColor, endColor, textColor, textShadow) {
      textColor = textColor || '#fff';
      textShadow = textShadow || '0 -1px 0 rgba(0,0,0,.25)';
      return "#{selector} {
         /* gradientBar will set the background to a pleasing blend of these, to support IE<=9 */
         #{this.gradientBar(startColor, endColor, textColor, textShadow)}
         *background-color: #{endColor}; /* Darken IE7 buttons by default so they stand out more given they won't have borders */
         #{this.reset_filter()}
       }
       /* in these cases the gradient won't cover the background, so we override */
       #{selector}:hover, #{selector}:focus, #{selector}:active, #{selector}.active, 
       #{selector}.disabled, #{selector}[disabled] {
         color: #{textColor};
         background-color: #{endColor};
         *background-color: #{darken(endColor, .05)};
       }

       /* IE 7 + 8 can't handle box-shadow to show active, so we darken a bit ourselves */
       #{selector}:active,
       #{selector}.active {
         background-color: #{darken(endColor, .1)} \\9;
       }"
    },

    // Navbar vertical align
    // -------------------------
    // Vertically center elements in the navbar.
    // Example: an element has a height of 30px, so write out `mixins.navbarVerticalAlign('30px');` to calculate the appropriate top margin.
    navbarVerticalAlign: elementHeight ->
      "margin-top: #{scale(add(vars.navbarHeight(), '-'+elementHeight), 1/2)};"
    ,

    // Grid System
    // -----------

    // Centered container element
    container_fixed: selector ->
      "#{selector} { 
        margin-right: auto;
        margin-left: auto;
       }
       #{this.clearfix(selector)}"
    ,

    // Table columns
    tableColumns: function(columnSpan) {
      columnSpan = columnSpan || 1;
      return "
       float: none; /* undo default grid column styles */
       width: #{add(add(scale(vars.gridColumnWidth(),columnSpan), 
                        scale(vars.gridGutterWidth(),columnSpan-1)), 
                    - 16) /* 16 is total padding on left and right of table cells */
               }
       margin-left: 0; /* undo default grid column styles */"
    },

    // Make a Grid
    // Use .makeRow and .makeColumn to assign semantic layouts grid system behaviour
    // XXX
    /*XXX .makeRow() {
  margin-left: @gridGutterWidth * -1;
  .clearfix();
}
.makeColumn(@columns: 1, @offset: 0) {
  float: left;
  margin-left: (@gridColumnWidth * @offset) + (@gridGutterWidth * (@offset - 1)) + (@gridGutterWidth * 2);
  width: (@gridColumnWidth * @columns) + (@gridGutterWidth * (@columns - 1));
}
*/

    // The Grid
    grid : {
      coreSpan: columns ->
        "width: #{add(scale(vars.gridColumnWidth(),columns),scale(vars.gridGutterWidth(),columns-1))};"
      ,

      core: function(gridColumnWidth, gridGutterWidth) {
        function span(columns) {
          return "width: #{add(scale(gridColumnWidth,columns),scale(gridGutterWidth,columns-1))};";
        }

        function spans() {
          var rv = "";
          for (var i=1; i<=vars.gridColumns(); ++i)
            rv += ".span#{i} { #{span(i)} }";
          return rv;
        }

        function offset(columns) {
          return "margin-left: #{add(scale(gridColumnWidth,columns),scale(gridGutterWidth,columns+1))};";
        }

        function offsets() {
          var rv = "";
          for (var i=1; i<=vars.gridColumns(); ++i)
            rv += ".offset#{i} { #{offset(i)} }";
          return rv;
        }

        return ".row { margin-left: #{scale(gridGutterWidth,-1)}; }
                #{mixins.clearfix('.row')}
                [class*='span'],
                .formrow > * /* Oni Labs edit: allow compound components on the same row in a form */
                {
                  float: left;
                  margin-left: #{gridGutterWidth};
                }
                /* Set the container width, and override it for 
                   fixed navbars in media queries */
                .container,
                .navbar-fixed-top .container,
                .navbar-fixed-bottom .container { #{span(vars.gridColumns()); }
                
                #{spans()}
                #{offsets()}
               ";
      },
      fluid: function(fluidGridColumnWidth, fluidGridGutterWidth) {
        function span(columns) {
          return "width: #{add(scale(fluidGridColumnWidth,columns),scale(fluidGridGutterWidth,columns-1))};";
          // XXX IE7 *width: (@fluidGridColumnWidth * @columns) + (@fluidGridGutterWidth * (@columns - 1)) - (.5 / @gridRowWidth * 100 * 1%);
          
        }

        function spans() {
          var rv = "";
          for (var i=1; i<=vars.gridColumns(); ++i)
            rv += ".row-fluid .span#{i} { #{span(i)} }";
          return rv;
        }

        function offset(columns) {
          return "margin-left: #{scale(fluidGridColumnWidth, columns) .. 
                                 add(scale(fluidGridGutterWidth, columns-1)) ..
                                 add(scale(fluidGridGutterWidth,2)) };";
          // XXX IE7 *margin-left: (@fluidGridColumnWidth * @columns) + (@fluidGridGutterWidth * (@columns - 1)) - (.5 / @gridRowWidth * 100 * 1%) + (@fluidGridGutterWidth*2) - (.5 / @gridRowWidth * 100 * 1%);
        }

        function offsetFirstChild(columns) {
          return "margin-left: #{scale(fluidGridColumnWidth, columns) .. 
                                 add(scale(fluidGridGutterWidth, columns-1)) ..
                                 add(fluidGridGutterWidth) };";
          // XXX IE7 *margin-left: (@fluidGridColumnWidth * @columns) + (@fluidGridGutterWidth * (@columns - 1)) - (.5 / @gridRowWidth * 100 * 1%) + @fluidGridGutterWidth - (.5 / @gridRowWidth * 100 * 1%);
        }

        function offsets() {
          var rv = '';
          for (var i=1; i<=vars.gridColumns(); ++i)
            rv += ".row-fluid .offset#{i} { #{offset(i)} }
                   .row-fluid .offset#{i}:first-child { #{offsetFirstChild(i)} }";
          return rv;
        }

        return ".row-fluid { width: 100% }
                #{mixins.clearfix('.row-fluid')}
                .row-fluid [class*='span']
                {
                  #{mixins.input_block_level()}
                  float: left;
                  margin-left: #{fluidGridGutterWidth};
                /* IE7XXX *margin-left: #XXX{add(fluidGridGutterWidth,scale('1%',-.5/#XXX{vars.gridRowWidth()}*100))}; */
                }
                .row-fluid [class*='span']:first-child {
                  margin-left: 0;
                }

                .row-fluid .controls-row [class*='span'] + [class*='span'] {
                  margin-left: #{fluidGridGutterWidth};
                }
                #{spans()}
                #{offsets()}
               ";
      },
      input: function(gridColumnWidth, gridGutterWidth) {
        function span(columns) {
          return "width: #{add(scale(gridColumnWidth, columns), scale(gridGutterWidth, columns - 1)).. add(-14)};"
        }

        function spans() {
          var rv = "";
          for (var i=1; i<=vars.gridColumns(); ++i)
            rv += "input.span#{i}, textarea.span#{i}, .uneditable-input.span#{i} { #{span(i)} }";
          return rv;
        }

        return ".input, textarea, .uneditable-input { margin-left: 0; /* override margin-left from core grid system */ }
                /* Space grid-sized controls properly if multiple per line */
                .controls-row [class*='span'] + [class*='span'] {
                  margin-left: #{gridGutterWidth};
                }

                #{spans()}
               ";
      }
    }
  };
  return mixins;
};
