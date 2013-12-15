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

exports.Notice = function(content, settings) {
  settings = settings || {};
  var cls = 'alert';
  if (settings['class']) cls += ' ' + settings['class'];

  var ft = @Widget('div', @Widget('div', content, {'class':cls}));
  ft = (settings.style || exports.NoticeStyle)(ft);
  return ft;
};
