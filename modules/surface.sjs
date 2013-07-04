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
exports.Unescaped = html.Unescaped;
exports.Markdown = html.Markdown;

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

exports.replaceContent = dyn.replaceContent;
exports.replaceElement = dyn.replaceElement;
exports.appendContent = dyn.appendContent;
exports.prependContent = dyn.prependContent;
exports.insertBefore = dyn.insertBefore;
exports.insertAfter = dyn.insertAfter;
exports.removeElement = dyn.removeElement;
exports.appendWidget = dyn.appendWidget;
exports.withWidget = dyn.withWidget;
exports.Prop = dyn.Prop;
exports.OnEvent = dyn.OnEvent;
exports.OnClick = dyn.OnClick;
