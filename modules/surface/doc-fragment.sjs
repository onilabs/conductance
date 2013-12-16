var { readFile } = require('sjs:nodejs/fs');
var { toPath } = require('sjs:url');
var { sanitize: escapeXML } = require('sjs:string');
@ = require('./base');

/**
  @summary Components for use in custom [./static::Document] templates
*/

var escapeCssAttr = (style) -> style.replace(/\s+/g, '') .. escapeXML;

/**
  @function errorHandler
  @return [surface::HtmlFragment]
  @summary Plain JavaScript content to set up a default `window.onerror` handler
  @desc
    Usage: place in <head> content, after [bootstrapCss].

    The error handler will be initialized as soon as this script is evaluated
    (does not require stratified.js), so you should put it as close to the
    start of the document as possible.
*/
exports.errorHandler = function() {
  var { _fixedNoticeStyle, _fixedNoticeAlertStyle } = require('./bootstrap/notice');
  return @Widget("script", "
    (function() {
      var errorIndicatorShown = false;
      function showErrorIndicator(e) {
        if (typeof(rainbow) !== 'undefined' && rainbow.hide) rainbow.hide();
        if (errorIndicatorShown) return;
        errorIndicatorShown = true;
        document.body.innerHTML = (
          \"<div style='#{_fixedNoticeStyle .. escapeCssAttr}'>\" +
            \"<div class='alert alert-danger' style='#{_fixedNoticeAlertStyle .. escapeCssAttr}'>\"+
              \"<strong>Error:</strong>\"+
              \" An uncaught error occurred, reload the page to try again.\"+
            \"</div>\"+
          \"</div>\");
      };
      window.onerror = showErrorIndicator;
    })();
  ");
};

var rainbowContents = readFile(require.url('./rainbow.min.js') .. toPath);
/**
  @function busyIndicator
  @return [surface::HtmlFragment]
  @param {Boolean} [showImmediately] whether to show the indicator on page load (default false)
  @param {Settings} [settings]
  @summary <script> tags to define `window.withBusyIndicator`
  @setting {String} [color] indicator color (CSS string)
  @setting {Number} [thickness] indicator thickness (in pixels)
  @setting {Number} [shadow] shadow blur size (in pixels)
*/
exports.busyIndicator = function(showImmediately, opts) {
  opts = opts || {};
  var color = opts.color || '#e91100';
  var thickness = opts.thickness === undefined ? 2 : opts.thickness;
  var shadow = opts.shadow === undefined ? 2 : opts.shadow;
  return [
    @Widget('script', rainbowContents),
    @Widget('script', "
        (function() {
          rainbow.config({barColors:['#{color}'], barThickness: #{thickness}, shadowBlur: #{shadow}});
          #{showImmediately ? "window.onload = function() {
            rainbow.show();
          };" : ""}
        })();
    "),
    @Widget('script', "
      var busy_indicator_refcnt = 0, busy_indicator_stratum, busy_indicator_shown = #{showImmediately ? 'true' : 'false'};

      function showBusyIndicator(delay) {
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

      function withBusyIndicator(block) {
        try {
          showBusyIndicator();
          block();
        }
        finally {
          hideBusyIndicator();
        }
      }
      window.withBusyIndicator = withBusyIndicator;
    ", {'type': 'text/sjs'}),
  ]
};

/**
  @function bootstrapCss
  @return [surface::HtmlFragment]
  @summary Bootstrap CSS styles
  @desc
    Place within <head>.
*/
exports.bootstrapCss = function() {
  return @Widget("link", null, {
    rel: 'stylesheet',
    href: "/__mho/surface/bootstrap/bootstrap-vanilla-3.css",
    media: 'screen'
  });
};

/**
  @function bootstrapJavascript
  @return [surface::HtmlFragment]
  @summary Bootstrap CSS styles
  @desc
    Typically, this is placed at the end of the <body>
    tag.
*/
exports.bootstrapJavascript = function() {
  return [
    @Widget('script', null, {src: "/__mho/surface/bootstrap/jquery-1.10.2.min.js"}),
    @Widget('script', null, {src: "/__mho/surface/bootstrap/bootstrap.min.js"}),
  ];
}
