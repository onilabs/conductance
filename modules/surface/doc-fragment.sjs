/* (c) 2013-2014 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

var { readFile } = require('sjs:nodejs/fs');
var { toPath } = require('sjs:url');
var { sanitize: escapeXML } = require('sjs:string');
@ = require(['./base','sjs:object']);

/**
  @summary Components for use in custom [./static::Document] templates
  @hostenv nodejs
*/

var escapeCssAttr = (style) -> style.replace(/\s+/g, '') .. escapeXML;

/**
  @function errorHandler
  @return {surface::HtmlFragment}
  @summary Plain JavaScript content to set up a default `window.onerror` handler
  @desc
    Usage: place in <head> content, after [bootstrapCss].

    The error handler will be initialized as soon as this script is evaluated
    (does not require stratified.js), so you should put it as close to the
    start of the document as possible.
*/
exports.errorHandler = function() {
  var { _fixedNoticeStyle, _fixedNoticeAlertStyle } = require('./bootstrap/notice');
  return @Element("script", "
    (function() {
      var errorIndicatorShown = false;
      var onerror = function() {
        onerror.triggered = true;
        window.inhibit_auto_busy_indicator = true;
        if (typeof(rainbow) !== 'undefined' && rainbow.hide) rainbow.hide();
        if (errorIndicatorShown) return;
        errorIndicatorShown = true;
        document.body.innerHTML = (
          \"<div style='#{_fixedNoticeStyle .. escapeCssAttr}'>\" +
            \"<div class='alert alert-danger' style='#{_fixedNoticeAlertStyle .. escapeCssAttr}'>\"+
              \"<strong>Error:</strong>\"+
              \" An uncaught error occurred. Reload the page to try again.\"+
            \"</div>\"+
          \"</div>\");
      };
      onerror.triggered = false;
      window.onerror = onerror;
      window.onbeforeunload = function() {
        // ignore errors when we're navigating away
        window.onerror = function() { return true; };
      }
    })();
  ");
};

var rainbowContents = readFile(require.url('./rainbow.min.js') .. toPath);
/**
  @function busyIndicator
  @return {surface::HtmlFragment}
  @param {Boolean} [showImmediately] whether to show the indicator on page load (default false)
  @param {Settings} [settings]
  @summary <script> tags to define `window.withBusyIndicator`
  @setting {String} [color] indicator color (CSS string)
  @setting {Number} [thickness] indicator thickness (in pixels)
  @setting {Number} [shadow] shadow blur size (in pixels)
*/
exports.busyIndicator = function(showImmediately, opts) {
  opts = opts || {};
  var color = opts.color || '#C43133';
  var thickness = opts.thickness === undefined ? 2 : opts.thickness;
  var shadow = opts.shadow === undefined ? 2 : opts.shadow;
  return [
    @Element('script', rainbowContents),
    @Element('script', "
        (function() {
          rainbow.config({barColors:['#{color}'], barThickness: #{thickness}, shadowBlur: #{shadow}});
          #{showImmediately ? "window.onload = function() {
            window.setTimeout(function() {
              if (window.inhibit_auto_busy_indicator) return;
              rainbow.show();
            }, 500);
          };
          window.auto_busy_indicator=true;
          " : ""}
        })();
    "),
    @Element('script', "
      var busy_indicator_refcnt = 0, busy_indicator_stratum, busy_indicator_shown = #{showImmediately ? 'true' : 'false'};

      function showBusyIndicator(delay) {
        window.inhibit_auto_busy_indicator = true;
        delay = delay || 500;
        if (++busy_indicator_refcnt === 1) {
          busy_indicator_stratum = spawn (function() {
            hold(delay);
            rainbow.show();
            busy_indicator_shown = true;
          })();
        }
      }

      function hideBusyIndicator() {
        // we're spawning/holding to get some hysteresis: if someone
        // calls showBusyIndicator next, we
        // don't want to stop a currently running indicator
        spawn (function() {
          hold(10);
          if (--busy_indicator_refcnt === 0) {
            if (busy_indicator_stratum) {
              busy_indicator_stratum.abort();
              busy_indicator_stratum = null;
            }
            if(busy_indicator_shown) {
              rainbow.hide();
              busy_indicator_shown = false;
            }
          }
        })();
      }

      __js var noop = function() {};
      function withBusyIndicator(block) {
        var done = function() {
          done = noop; // prevent duplicate calls
          hideBusyIndicator();
        }
        try {
          showBusyIndicator();
          return block ? block(done);
        }
        finally {
          done();
        }
      }
      window.withBusyIndicator = withBusyIndicator;
    ", {'type': 'text/sjs'}),
  ]
};

/**
  @function bootstrapCss
  @return {surface::HtmlFragment}
  @summary Bootstrap CSS styles
  @desc
    Place within <head>.
*/
exports.bootstrapCss = function() {
  return @Element("link", null, {
    rel: 'stylesheet',
    href: "/__mho/surface/bootstrap/bootstrap-vanilla-3.css"
//    media: 'screen'
  });
};

/**
  @variable bootstrapColors
  @summary Object with default bootstrap CSS colors
  @desc
    Useful for exposing in a `mho:app` file
*/
var bootstrapColors = exports.bootstrapColors = {
  gray_darker: "#222",
  gray_dark:   "#333",
  gray:        "#555",
  gray_light:  "#999",
  gray_lighter:"#eee",
  primary:     "#428bca",
  success:     "#5cb85c",
  info:        "#5bc0de",
  warning:     "#f0ad4e",
  danger:      "#d9534f"
};

/**
  @variable mhoColors 
  @summary Object with default mho CSS colors
  @desc
    Useful for exposing in a `mho:app` file
*/
var mhoColors = exports.mhoColors = bootstrapColors .. @merge({
  onilabs_red:          "#b9090b",
  primary:              "#b9090b",
  onilabs_redhighlight: "#c43133",
  bootstrap:            bootstrapColors
});


/**
  @function conductanceCss
  @return {surface::HtmlFragment}
  @summary Conductance CSS styles
  @desc
    Place within <head> after [::bootstrapCss]
*/

exports.conductanceCss = function() {
  return `<style type="text/css">
            @font-face {
              font-family: Montserrat;
              src: url('/__mho/surface/fonts/Montserrat/Montserrat-Regular.ttf');
            }
            
            h1, h2, h3, h4, h5, h6, .lead, .btn {
              font-family: 'Montserrat';
            }

            a, .btn-link { color: ${mhoColors.onilabs_red}; }
            a:hover, a:active, .btn-link:hover, .btn-link:active { color: ${mhoColors.onilabs_redhighlight}; }

            code {
              color:#333;
            }

            code, pre {
              background-color: #FEFAFA;
              border: 1px solid #F5E1E1;
            }

            pre > code {
              border: none;
            }

            .btn-primary { 
              background-color: ${mhoColors.onilabs_red}; 
              border-color: ${mhoColors.onilabs_redhighlight};  
            }
            .btn-primary:hover, .btn-primary:active, .btn-primary:focus { 
              background-color: ${mhoColors.onilabs_redhighlight}; 
              border-color: ${mhoColors.onilabs_redhighlight}; 
            }

          </style>
         `;
};


/**
  @function bootstrapJavascript
  @return {surface::HtmlFragment}
  @summary Bootstrap CSS styles
  @desc
    Typically, this is placed at the end of the <body>
    tag.
*/
exports.bootstrapJavascript = function() {
  return [
    @Element('script', null, {src: "/__mho/surface/bootstrap/jquery-1.10.2.min.js"}),
    @Element('script', null, {src: "/__mho/surface/bootstrap/bootstrap.min.js"}),
  ];
}
