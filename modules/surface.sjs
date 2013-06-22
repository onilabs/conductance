var html    = require('./surface/html');
var stat    = require('./surface/static');
var dyn     = require('./surface/dynamic');
var widgets = require('./surface/widgets');

exports.Style = html.Style;
exports.RequireStyle = html.RequireStyle;
exports.Mechanism = html.Mechanism;
exports.Widget = html.Widget;
exports.Class = html.Class;
exports.Attrib = html.Attrib;
exports.Id = html.Id;
exports.Prop = html.Prop;

exports.CSSDocument = stat.CSSDocument;
exports.Document = stat.Document;

exports.appendHtml = dyn.appendHtml;
exports.replaceHtml = dyn.replaceHtml;
exports.removeContent = dyn.removeHtml;
exports.removeElement = dyn.removeElement;
exports.withHtml = dyn.withHtml;

exports.Div = widgets.Div;
exports.TextInput = widgets.TextInput;