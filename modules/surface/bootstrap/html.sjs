@ = require(['sjs:object', '../../surface']);

var base_html = require('../html');


// export all elements from surface/html.sjs:

exports .. @extend(base_html);

// ... and override with bootstrap specializations:

// XXX there has to be a better way to set the classes here
function wrapWithClass(baseWidget, cls) {
  return (content, attribs) -> baseWidget(content, attribs) .. @Class(cls);
}

exports.Button = wrapWithClass(base_html.Button, 'btn');

exports.Table = wrapWithClass(base_html.Table, 'table');

// XXX the first argument for these don't make sense; maybe it should be the value
exports.Input = wrapWithClass(base_html.Input, 'form-control');
exports.TextArea = wrapWithClass(base_html.TextArea, 'form-control');

exports.Select = wrapWithClass(base_html.Select, 'form-control');

exports.Icon = name -> @Widget('span', '', { 'class': "glyphicon glyphicon-#{name}"});

exports.Row = (content, attribs) -> @Widget('div', content, attribs) .. @Class('row');

exports.ColSm = (n, content, attribs) -> @Widget('div', content, attribs) .. @Class("col-sm-#{n}");

exports.Container = (content, attribs) -> @Widget('div', content, attribs) .. @Class('container');

exports.Label = (content, attribs) -> @Widget('label', content, attribs) .. @Class("label #{attribs.type ? "label-#{attribs.type}" : ''}");

exports.PageHeader = (content, attribs) -> @Widget('div', `<h1>$content</h1>`, attribs) .. @Class('page-header');

