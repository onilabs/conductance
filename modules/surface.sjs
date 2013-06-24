var html    = require('./surface/html');
var stat    = require('./surface/static');
var dyn     = require('./surface/dynamic');
var widgets = require('./surface/widgets');

//----------------------------------------------------------------------
// primitives allowed in both 'static' and 'dynamic' worlds:

exports.Style = html.Style;
exports.RequireStyle = html.RequireStyle;
exports.Mechanism = html.Mechanism;
exports.Widget = html.Widget;
exports.Class = html.Class;
exports.Attrib = html.Attrib;
exports.Id = html.Id;

exports.Div = widgets.Div;
exports.Button = widgets.Button;
exports.Form = widgets.Form;
exports.TextInput = widgets.TextInput;
exports.Select = widgets.Select;

//----------------------------------------------------------------------
// primitives for the 'static' world:

exports.CSSDocument = stat.CSSDocument;
exports.Document = stat.Document;

//----------------------------------------------------------------------
// primitives for the 'dynamic' world:

exports.appendHtml = dyn.appendHtml;
exports.replaceHtml = dyn.replaceHtml;
exports.removeContent = dyn.removeHtml;
exports.removeElement = dyn.removeElement;
exports.withHtml = dyn.withHtml;
exports.Prop = dyn.Prop;
exports.OnEvent = dyn.OnEvent;
exports.OnClick = dyn.OnClick;
