/**
  @summary A simple floating notice widget
*/

@ = require('mho:surface');

exports._fixedNoticeStyle = "
        position: fixed;
        top:1em;
        left:0;
        right:0;
        height:0;
        text-align: center;
";

exports._fixedNoticeAlertStyle = "
        display: inline-block;
        text-align:left;
        color:black;
        padding: 8px;
        border-radius: 3px;
";


exports.NoticeStyle = function() {
  var style;
  return function() {
    if (!style) {
      style = @Style("
        {
          #{exports._fixedNoticeStyle}
        }
        .alert {
          #{exports._fixedNoticeAlertStyle}
        }
      ");
    }
    return style.apply(null, arguments);
  }
}();

/**
  @function Notice
  @param {surface/HtmlFragment} [content]
  @param {optional Settings} [settings]
  @setting {surface/Style} [style]
  @setting {String} [class] additional class to place on notice
  @desc
    The notice contains a default style which sets
    position:fixed and centers it on-screen.

    `content` is wrapped in a container with the "alert"
    bootstrap class, so you can turn it into an error
    alert by passing 'alert-danger' for the `class` setting.
*/
exports.Notice = function(content, settings) {
  settings = settings || {};
  var cls = 'alert';
  if (settings['class']) cls += ' ' + settings['class'];

  var ft = @Element('div', @Element('div', content, {'class':cls}));
  ft = (settings.style || exports.NoticeStyle)(ft);
  return ft;
};
