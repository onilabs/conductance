var html  = require('./surface/html');
var stat  = require('./surface/static');
var dyn   = require('./surface/dynamic');

exports.Style = html.Style;
exports.RequireStyle = html.RequireStyle;
exports.Mechanism = html.Mechanism;
exports.Widget = html.Widget;

exports.CSSDocument = stat.CSSDocument;
exports.Document = stat.Document;

exports.appendHtml = dyn.appendHtml;
exports.removeElement = dyn.removeElement;
exports.withHtml = dyn.withHtml;
