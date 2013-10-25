var base    = require('./surface/base');
var dyn     = require('./surface/dynamic');

if (require('sjs:sys').hostenv === 'xbrowser') {
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
  exports.prependWidget = dyn.prependWidget;
  exports.withWidget = dyn.withWidget;
  exports.Prop = dyn.Prop;
  exports.OnEvent = dyn.OnEvent;
  exports.OnClick = dyn.OnClick;
} else {
  var stat    = require('./surface/static');
  //----------------------------------------------------------------------
  // primitives for the 'static' world:

  exports.CSSDocument = stat.CSSDocument;
  exports.Document = stat.Document;
  exports.loadTemplate = stat.loadTemplate;
}

//----------------------------------------------------------------------
// primitives allowed in both 'static' and 'dynamic' worlds:

exports.Style = base.Style;
exports.RequireStyle = base.RequireStyle;
exports.Mechanism = base.Mechanism;
exports.Widget = base.Widget;
exports.Class = base.Class;
exports.Attrib = base.Attrib;
exports.Id = base.Id;
exports.RawHTML = base.RawHTML;
exports.Markdown = base.Markdown;
exports.RequireExternalScript = base.RequireExternalScript;

