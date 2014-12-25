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

var { hostenv } = require('builtin:apollo-sys');

var imports = [
  'sjs:std',
  '../../surface', 
  {id:'./html', name: 'html'}
]; 

if (hostenv === 'xbrowser') {
  imports = imports.concat([
    {id:'../field', name:'field'}
  ]);
}

@ = require(imports);

/**
  @nodoc
  @noindex
  (documented as mho:surface/bootstrap)
*/

// xxx helper that's also in ../html.sjs
// map each value of a stream of input if it is an Observable / Stream, else
// just `map` them.
function _map(items, fn) {
  if (@isStream(items))
    return items .. @transform(val -> @map(val, fn));
  return items .. @map(fn);
}

function prefixClasses(classes, prefix) {
  if (!classes) return [];
  return classes.split(' ') .. @map(cls -> prefix+cls);
}

// xxx the following helpers are also in ./html.sjs:
// XXX there has to be a better way to set the classes here
__js function wrapWithClass(baseElement, cls) {
  return () -> baseElement.apply(null, arguments) .. @Class(cls);
}

__js function callWithClass(baseElement, cls, content, attribs) {
  return baseElement.call(null, content, attribs) .. @Class(cls);
}

// XXX use of @Class this way is undocumented, but works
// for an array of non-observable class names
var callWithClasses = callWithClass;


//----------------------------------------------------------------------
// LOW-LEVEL BOOTSTRAP-SPECIFIC ELEMENTS:

/**
  @function TextRight
  @altsyntax element .. TextRight
  @summary Decorator that causes text in the given block element to be right aligned
  @param {surface::HtmlFragment} [element] block element (e.g. `Div`, `P`, `H1`)
  @return {surface::Element}
  @desc
    Returns a copy of `element` with bootstrap's "text-right" class added to the
    element's class list (see http://getbootstrap.com/css/#type-alignment).

    If `TextRight` is applied to a [surface::HtmlFragment] that is not of class [surface::Element],
    `element` will automatically be wrapped using [surface::ensureElement].

    `TextRight` is ineffective if `element` is an inline element (`Span`, etc).
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult(
        "@Div('This is left aligned')",
        @Div('This is left aligned')),
      @demo.CodeResult(
        "@Div('This is right aligned') .. @TextRight",
        @Div('This is right aligned') .. @TextRight)
        ]);

*/
exports.TextRight = element -> element .. @Class('text-right');

/**
  @function TextCenter
  @altsyntax element .. TextCenter
  @summary Decorator that causes text in the given block element to be horizontally centered
  @param {surface::HtmlFragment} [element] block element (e.g. `Div`, `P`, `H1`)
  @return {surface::Element}
  @desc
    Returns a copy of `element` with bootstrap's "text-center" class added to the
    element's class list (see http://getbootstrap.com/css/#type-alignment).

    If `TextCenter` is applied to a [surface::HtmlFragment] that is not of class [surface::Element],
    `element` will automatically be wrapped using [surface::ensureElement].

    `TextCenter` is ineffective if `element` is an inline element (`Span`, etc).
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult(
        "@Div('This is left aligned')",
        @Div('This is left aligned')),
      @demo.CodeResult(
        "@Div('This is center aligned') .. @TextCenter",
        @Div('This is center aligned') .. @TextCenter)
        ]);

*/
exports.TextCenter = element -> element .. @Class('text-center');

/**
  @function TextJustify
  @altsyntax element .. TextJustify
  @summary Decorator that causes text in the given block element to be justified
  @param {surface::HtmlFragment} [element] block element (e.g. `Div`, `P`, `H1`)
  @return {surface::Element}
  @desc
    Returns a copy of `element` with bootstrap's "text-justify" class added to the
    element's class list (see http://getbootstrap.com/css/#type-alignment).

    If `TextJustify` is applied to a [surface::HtmlFragment] that is not of class [surface::Element],
    `element` will automatically be wrapped using [surface::ensureElement].

    `TextJustify` is ineffective if `element` is an inline element (`Span`, etc).
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var content = @cycle(['The quick brown fox jumps over the lazy dog. ']) .. @take(10) .. @toArray;

    @mainContent .. @appendContent([
      @demo.CodeResult(
        "@Div('The quick brown fox ...')",
        @Div(content)),
      @demo.CodeResult(
        "@Div('The quick brown fox ...') .. @TextJustify",
        @Div(content) .. @TextJustify)
        ]);

*/
exports.TextJustify = element -> element .. @Class('text-justify');


/**
  @function Btn
  @summary Bootstrap-style button ("class='btn'") with additional `btn-*` classes applied.
  @param {String} [btn_classes] String of `btn-*` classes to apply to the button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    `btn_classes` is a space-separated list of `btn-*` classes that should be applied to the
    button:

    * **style**: `default`, `primary`, `success`, `info`, `warning`, `danger`, or `link`
    * **sizing**: `lg`, `sm`, or `xs` (or none)
    * **block-level**: `block` (or none)

    See also http://getbootstrap.com/css/#buttons


  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    var btn_styles = ['default', 'primary', 'success', 'info', 'warning', 'danger', 'link'];
    var btn_sizes  = ['lg', '', 'sm', 'xs' ];
    @mainContent .. @appendContent([
      btn_styles ..
        @unpack(cls -> btn_sizes .. @transform(size -> "#{cls} #{size}")) ..
        @transform(cls -> @Btn(cls, "@Btn('#{cls}',CONTENT)") .. @Style("margin:10px;")) ..
        @toArray,
      @Hr(),
      @Btn('block primary', "@Btn('block primary', CONTENT)"),
      @Hr(),

      @demo.CodeResult(
        "@Btn('primary',\n      `$@Icon('cloud-download') Download`)",
        @Btn('primary',`$@Icon('cloud-download') Download`))
    ]);
*/
exports.Btn = (btn_classes, content, attribs) ->
  callWithClass(@html.Button,
    ['btn'].concat(prefixClasses(btn_classes,'btn-')),
    content, attribs);

/**
  @variable AvailableIcons
  @summary Array of names accepted by [::Icon]
*/
var AvailableIcons = exports.AvailableIcons = [
'asterisk', 'plus', 'euro', 'minus', 'cloud', 'envelope', 'pencil', 'glass', 'music', 'search', 'heart', 'star', 'star-empty', 'user', 'film', 'th-large', 'th', 'th-list', 'ok', 'remove', 'zoom-in', 'zoom-out', 'off', 'signal', 'cog', 'trash', 'home', 'file', 'time', 'road', 'download-alt', 'download', 'upload', 'inbox', 'play-circle', 'repeat', 'refresh', 'list-alt', 'lock', 'flag', 'headphones', 'volume-off', 'volume-down', 'volume-up', 'qrcode', 'barcode', 'tag', 'tags', 'book', 'bookmark', 'print', 'camera', 'font', 'bold', 'italic', 'text-height', 'text-width', 'align-left', 'align-center', 'align-right', 'align-justify',
'list', 'indent-left', 'indent-right', 'facetime-video', 'picture', 'map-marker', 'adjust', 'tint', 'edit', 'share', 'check', 'move', 'step-backward', 'fast-backward', 'backward', 'play', 'pause', 'stop', 'forward', 'fast-forward', 'step-forward', 'eject', 'chevron-left', 'chevron-right', 'plus-sign', 'minus-sign', 'remove-sign', 'ok-sign', 'question-sign', 'info-sign', 'screenshot', 'remove-circle', 'ok-circle', 'ban-circle', 'arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'share-alt', 'resize-full', 'resize-small', 'exclamation-sign', 'gift', 'leaf', 'fire', 'eye-open', 'eye-close', 'warning-sign', 'plane', 'calendar', 'random', 'comment', 'magnet', 'chevron-up', 'chevron-down', 'retweet', 'shopping-cart', 'folder-close', 'folder-open', 'resize-vertical', 'resize-horizontal', 'hdd', 'bullhorn', 'bell',
'certificate', 'thumbs-up', 'thumbs-down', 'hand-right', 'hand-left', 'hand-up', 'hand-down', 'circle-arrow-right', 'circle-arrow-left', 'circle-arrow-up', 'circle-arrow-down', 'globe', 'wrench', 'tasks', 'filter', 'briefcase', 'fullscreen', 'dashboard', 'paperclip', 'heart-empty', 'link', 'phone', 'pushpin', 'usd', 'gbp', 'sort', 'sort-by-alphabet', 'sort-by-alphabet-alt', 'sort-by-order', 'sort-by-order-alt', 'sort-by-attributes', 'sort-by-attributes-alt', 'unchecked', 'expand', 'collapse-down', 'collapse-up', 'log-in', 'flash', 'log-out', 'new-window', 'record', 'save', 'open', 'saved', 'import', 'export', 'send', 'floppy-disk', 'floppy-saved', 'floppy-remove', 'floppy-save', 'floppy-open', 'credit-card', 'transfer',
'cutlery', 'header', 'compressed', 'earphone', 'phone-alt', 'tower', 'stats', 'sd-video', 'hd-video', 'subtitles', 'sound-stereo', 'sound-dolby', 'sound-5-1', 'sound-6-1', 'sound-7-1', 'copyright-mark', 'registration-mark', 'cloud-download', 'cloud-upload', 'tree-conifer', 'tree-deciduous'
];

/**
  @feature Special Classes
  @summary Special classes that can be applied to elements
*/

/**
  @function Icon
  @param {String} [name] Name of icon, see [::AvailableIcons]
  @summary Scalable Bootstrap Glyphicon  (`<span class="glyphicon glyphicon-{name}">`)
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    var ColStyle = @CSS(`{padding-bottom:8px;}`);
    @mainContent .. @appendContent([@Row(
      @AvailableIcons .. @map(name ->
        @Col('md-3 sm-4 xs-6', [@Icon(name), `&nbsp;&nbsp;@Icon('${@Strong(name)}')`]) ..
        ColStyle
      )
    ),
    @Hr(),
    @demo.CodeResult(
      "@Icon('heart') .. @Style('color:red;font-size:80px;')",
      @Icon('heart') .. @Style('color:red;font-size: 80px'))
    ]);
*/
exports.Icon = (name, attribs) -> callWithClasses(@html.Span, ["glyphicon", "glyphicon-#{name}"], '', attribs);

/**
  @function Row
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary A row container in a Bootstrap grid (`<div class="row">`)
  @return {surface::Element}
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var css = @GlobalCSS("
      .demo [class^=col-] {
        background-color: rgba(86,61,124,.15);
        border: 1px solid rgba(86,61,124,.2);
        padding-top: 10px;
        padding-bottom: 10px;
      }
    ");

    @mainContent .. @appendContent([
      css,

      @demo.CodeResult("\
    @Row([
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1'),
      @Col('md-1', 'md-1')
    ])",
    @Div([
      @Row([
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1'),
        @Col('md-1', 'md-1')
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    @Row([
      @Col('md-8', 'md-8'),
      @Col('md-4', 'md-4')
    ])",
    @Div([
      @Row([
        @Col('md-8', 'md-8'),
        @Col('md-4', 'md-4')
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    @Row([
      @Col('md-4', 'md-4'),
      @Col('md-4', 'md-4'),
      @Col('md-4', 'md-4')
    ])",
    @Div([
      @Row([
        @Col('md-4', 'md-4'),
        @Col('md-4', 'md-4'),
        @Col('md-4', 'md-4')
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    @Row([
      @Col('md-6', 'md-6'),
      @Col('md-6', 'md-6')
    ])",
    @Div([
      @Row([
        @Col('md-6', 'md-6'),
        @Col('md-6', 'md-6')
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    @Row([
      @Col('md-9', 'md-9'),
      @Col('md-4', `md-4 $@P('Columns wrap if they are greater than 12')`),
      @Col('md-6', 'md-6')
    ])",
    @Div([
      @Row([
        @Col('md-9', 'md-9'),
        @Col('md-4', `md-4 $@P('Columns wrap if they are greater than 12')`),
        @Col('md-6', 'md-6')
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    [
      @Row([
        @Col('md-4', 'md-4'),
        @Col('md-4 md-offset-4', 'md-4 md-offset-4')
      ]),
      @Row([
        @Col('md-3 md-offset-3', 'md-3 md-offset-3'),
        @Col('md-3 md-offset-3', 'md-3 md-offset-3')
      ]),
      @Row([
        @Col('md-6 md-offset-3', 'md-6 md-offset-3')
      ])
    ]",
    @Div([
      @Row([
        @Col('md-4', 'md-4'),
        @Col('md-4 md-offset-4', 'md-4 md-offset-4')
      ]),
      @Row([
        @Col('md-3 md-offset-3', 'md-3 md-offset-3'),
        @Col('md-3 md-offset-3', 'md-3 md-offset-3')
      ]),
      @Row([
        @Col('md-6 md-offset-3', 'md-6 md-offset-3')
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    @Row([
      @Col('sm-9', [
        'Level 1: sm-9',
        @Row([
          @Col('sm-6', 'Level 2: sm-6'),
          @Col('sm-6', 'Level 2: sm-6')
        ])
      ])
    ])",
    @Div([
      @Row([
        @Col('sm-9', [
          'Level 1: sm-9',
          @Row([
            @Col('sm-6', 'Level 2: sm-6'),
            @Col('sm-6', 'Level 2: sm-6')
          ])
        ])
      ])
    ], { 'class': 'demo' })),

    @demo.CodeResult("\
    @Row([
      @Col('md-9 md-push-3', 'md-9 md-push-3'),
      @Col('md-3 md-pull-9', 'md-3 md-pull-9')
    ])",
    @Div([
      @Row([
        @Col('md-9 md-push-3', 'md-9 md-push-3'),
        @Col('md-3 md-pull-9', 'md-3 md-pull-9')
      ])
    ], { 'class': 'demo' }))
    ]);
*/
exports.Row = wrapWithClass(@html.Div, 'row');

/**
  @function Col
  @summary A column container in a Bootstrap grid (`<div class="col_classes">`)
  @param {String} [col_classes] String of `col-*` classes to apply to the col
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    See [::Row] for examples.

    ----

    `col_classes` is a space-separated list of `col-*` classes that
    should be applied to the col (`N` designates an integer between 1-12, `M` an integer between 0-11):

    * **width**: one or more of `xs-N`, `sm-N`, `md-N`, `lg-N`.
    * **offset**: one or more of `xs-offset-M`, `sm-offset-M`, `md-offset-M`, `lg-offset-M`.
    * **pulling left**: one or more of `xs-pull-M`, `sm-pull-M`, `md-pull-M`, `lg-pull-M`.
    * **pushing right**: one or more of `xs-push-M`, `sm-push-M`, `md-push-M`, `lg-push-M`.
*/
exports.Col = (col_classes, content, attribs) ->
  callWithClasses(@html.Div, prefixClasses(col_classes,'col-'), content, attribs);

/**
  @function Container
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary A bootstrap container (`<div class="container">`)
  @return {surface::Element}
  @desc
    [::Container] centers its content and scales it in discrete steps
    according to screen width.

    ### Notes

    * See also http://getbootstrap.com/css/#overview-container.

    * Bootstrap requires a containing element to wrap site contents
    and house the grid system. You can choose between [::Container]
    or [::FluidContainer].

    * Containers are not nestable.

    * *.app file ([mho:#features/app-file::]) with Bootstrap-enabled doc-templates
    ([mho:surface/doc-template/::]) will typically already have a Container element.
    E.g. the [mho:surface/doc-template/app-default::] template's
    [mho:surface/doc-template/app-default::mainContent] element will be a [::Container]
    by default, or a [::FluidContainer] if the
    [mho:surface/doc-template/app-default::@template-fluid] directive is set to `true`.
*/
exports.Container = wrapWithClass(@html.Div, 'container');

/**
  @function FluidContainer
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary A fluid bootstrap container (`<div class="container-fluid">`)
  @return {surface::Element}
  @desc
    [::FluidContainer] lays out its content full-width and fluid.

    See the notes for [::Container]
*/
exports.FluidContainer = wrapWithClass(@html.Div, 'container-fluid');


/**
  @function Lead
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Lead body paragraph (`<p class='lead'>`)
  @return {surface::Element}
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult(
      "\
    [
     @Lead('This is a lead paragraph.'),
     @P('This is a normal paragraph.')
    ]",
      [@Lead('This is a lead paragraph.'),
       @P('This is a normal paragraph.')]
      )
    ])

*/
exports.Lead = wrapWithClass(@html.P, 'lead');

/**
  @function Lbl
  @summary Bootstrap label (`<span class='label'>`)
  @param {optional String} [variant='default'] `label-*` class to apply to the label
  @param {surface::HtmlFragment} [content]
  @return {surface::Element}
  @desc
    See also http://getbootstrap.com/components/#labels.

    `variant` is an optional `label-*` class to apply to the label:

    * **style**: `default`, `primary`, `success`, `info`, `warning`, or `danger`

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult(
        "`$@Lbl('Default')
     $@Lbl('primary', 'Primary')
     $@Lbl('success', 'Success')
     $@Lbl('info', 'Info')
     $@Lbl('warning', 'Warning')
     $@Lbl('danger', 'Danger')`",
        `$@Lbl('Default')
         $@Lbl('primary', 'Primary')
         $@Lbl('success', 'Success')
         $@Lbl('info', 'Info')
         $@Lbl('warning', 'Warning')
         $@Lbl('danger', 'Danger')
        `
      ),
      @demo.CodeResult(
        "@H3(['Example heading ', @Lbl('New')])",
        @H3(['Example heading ', @Lbl('New')])
      )
    ]);
*/
exports.Lbl = function(/*lbl_classes, content */) {
  if (arguments.length > 1)
    var [cls,content] = arguments;
  else {
    cls='default';
    content = arguments[0];
  }
  return @Element('span', content, {'class':'label '+prefixClasses(cls, 'label-')});
}


/**
  @function Badge
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary 'Badge' typically used for highlighting new or unread items (`<span class='badge'>`)
  @return {surface::Element}
  @desc
    * See http://getbootstrap.com/components/#badges
    * Collapses when `content` is empty
    * Style adapts automatically to 'active' state in pills
    * Automatically pulled right in [::ListGroupItem]s
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var Items = @generate(Math.random) ..
      @transform(x -> (hold(1000), Math.round(x*100)));

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @A(`Inbox $@Badge(42)`)",
        @A(`Inbox $@Badge(42)`)
      ),
      @demo.CodeResult("\
    var Items = @ObservableVar(0);
    ...
    @A(`Inbox $@Badge(Items)`)",
        @A(`Inbox $@Badge(Items)`)
      )
    ])

*/
exports.Badge = wrapWithClass(@html.Span, 'badge');

/**
  @function Jumbotron
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary A component for showcasing key content (`<div class='jumbotron'>`)
  @return {surface::Element}
  @desc
    * See http://getbootstrap.com/components/#jumbotron
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Jumbotron([
      @H1('Hello, world!'),
      @P(...),
      @P(@Btn('primary lg', 'Learn more'))
    ])",
        @Jumbotron([
          @H1('Hello, world!'),
          @P('This is a simple hero unit, a simple jumbotron-style
              component for calling extra attention to featured content or
              information.'),
          @P(@Btn('primary lg', 'Learn more'))
        ])
      )]);

*/
exports.Jumbotron = wrapWithClass(@html.Div, 'jumbotron');

/**
  @function ListGroup
  @param {Array} [items] Array of [surface::HtmlFragment]s
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap list group (`<div class='list-group'><div class='list-group-item'>...</div>...</div>`)
  @return {surface::Element}
  @desc
    This function will automatically wrap children with `list-group-item`, so
    you only need to use [::ListGroupItem] when inserting children dynamically
    (e.g. using [surface::appendContent]), or if you want special styling.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @ListGroup([
      'foo',
      'bar',
      'qux'
    ])",
    @ListGroup([
      'foo',
      'bar',
      'qux'
    ])),

      @demo.CodeResult("\
    @ListGroup([
      `foo ${@Badge(10)}`,
      `bar ${@Badge(20)}`,
      `qux ${@Badge(30)}`
    ])",
    @ListGroup([
      `foo ${@Badge(10)}`,
      `bar ${@Badge(20)}`,
      `qux ${@Badge(30)}`
    ])),

      @demo.CodeResult("\
    @ListGroup([
      @ListGroupItem('success', 'success'),
      @ListGroupItem('info', 'info'),
      @ListGroupItem('warning', 'warning'),
      @ListGroupItem('danger', 'danger')
    ])",
    @ListGroup([
      @ListGroupItem('success', 'success'),
      @ListGroupItem('info', 'info'),
      @ListGroupItem('warning', 'warning'),
      @ListGroupItem('danger', 'danger')
    ]))
    ]);
*/
exports.ListGroup = (items, attribs) -> callWithClass(@html.Div, 'list-group',
  items .. _map(item -> item .. @isElementWithClass('list-group-item') ? item : @html.Div(item, {'class':'list-group-item'})),
  attribs);


/**
  @function ListGroupItem
  @param {optional String} [cls] String of `list-group-item-*` suffixes.
  @param {surface::HtmlFragment} [content]
  @summary Bootstrap list group item (`<div class='list-group-item'>...</div>`)
  @return {surface::Element}
  @desc
    `cls` can be `success`, `info`, `warning`, or `danger`.

    See [::ListGroup] for examples.

    ----

    [::ListGroup] will automatically wrap children with `list-group-item`, so
    this function is only needed when inserting elements dynamically (e.g. using
    [surface::appendContent]), or if you want special styling.
*/
exports.ListGroupItem = function(/*cls, content*/) {
  if (arguments.length > 1)
    var [cls,content] = arguments;
  else {
    cls = '';
    content = arguments[0];
  }

  return @Element('div', content, {'class': 'list-group-item '+prefixClasses(cls, 'list-group-item-') });
}


/**
  @function EmbedResponsive
  @summary Bootstrap (`<div class="embed-responsive">`)
  @param {surface::HtmlFragment} [content]
  @param {Object} [settings]
  @setting {String} [ratio] Must be either `"16by9"` or `"4by3"`
  @return {surface::Element}
  @desc
    See also http://getbootstrap.com/components/#responsive-embed.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @EmbedResponsive([
      @Iframe(null, {
        src: 'http://www.youtube.com/embed/zpOULjyy-n8?rel=0'
      })
    ], { ratio: '16by9' })",
    @EmbedResponsive([
      @Iframe(null, {
        src: 'http://www.youtube.com/embed/zpOULjyy-n8?rel=0'
      })
    ], { ratio: '16by9' })),

      @demo.CodeResult("\
    @EmbedResponsive([
      @Iframe(null, {
        src: 'http://www.youtube.com/embed/zpOULjyy-n8?rel=0'
      })
    ], { ratio: '4by3' })",
    @EmbedResponsive([
      @Iframe(null, {
        src: 'http://www.youtube.com/embed/zpOULjyy-n8?rel=0'
      })
    ], { ratio: '4by3' }))
    ]);
*/
exports.EmbedResponsive = function (content, settings) {
  var classes = ['embed-responsive'];

  if (settings.ratio == null) {
    throw new Error("Must include ratio");
  } else {
    if (settings.ratio === '16by9' || settings.ratio === '4by3') {
      classes.push('embed-responsive-' + settings.ratio);
    } else {
      throw new Error("Expected ratio to be \"16by9\" or \"4by3\" but got: #{settings.ratio}");
    }
  }

  // TODO what about "embed-responsive-item" ?
  return base_html.Div(content) ..@Class(classes);
};

/**
  @function Well
  @summary Bootstrap (`<div class="well">`)
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [settings]
  @setting {optional String} [size] Must be either `"lg"` or `"sm"`
  @return {surface::Element}
  @desc
    See also http://getbootstrap.com/components/#wells.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Well('well sm', { size: 'sm' })",
    @Well('well sm', { size: 'sm' })),

      @demo.CodeResult("\
    @Well('well')",
    @Well('well')),

      @demo.CodeResult("\
    @Well('well lg', { size: 'lg' })",
    @Well('well lg', { size: 'lg' }))
    ]);
*/
exports.Well = function (content, settings) {
  var classes = ['well'];

  if (settings != null) {
    if (settings.size != null) {
      if (settings.size === 'lg' || settings.size === 'sm') {
        classes.push('well-' + settings.size);
      } else {
        throw new Error("Expected size to be \"lg\" or \"sm\" but got: #{settings.size}");
      }
    }
  }

  return base_html.Div(content) ..@Class(classes);
};


/**
  @function Thumbnail
  @summary Bootstrap (`<div class="thumbnail">`)
  @param {Object} [settings]
  @setting {surface::HtmlFragment} [image] Image to display
  @setting {optional String} [url] URL to link to when clicking on the image
  @setting {optional surface::HtmlFragment} [caption] Content to display below the image
  @return {surface::Element}
  @desc
    See also http://getbootstrap.com/components/#thumbnails.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var img1 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDE3MSAxODAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iMTcxIiBoZWlnaHQ9IjE4MCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjYwLjUiIHk9IjkwIiBzdHlsZT0iZmlsbDojQUFBQUFBO2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjEwcHQ7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+MTcxeDE4MDwvdGV4dD48L2c+PC9zdmc+';
    var img2 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMjQyIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDI0MiAyMDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iMjQyIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjkzIiB5PSIxMDAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MTFwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj4yNDJ4MjAwPC90ZXh0PjwvZz48L3N2Zz4=';
    var text = 'Cras justo odio, dapibus ac facilisis in, egestas eget quam. Donec id elit non mi porta gravida at eget metus. Nullam id dolor id nibh ultricies vehicula ut id elit.';

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Thumbnail({
      image: @Img({ src: '...' })
    })",
    @Thumbnail({
      image: @Img({ src: img1 })
    })),

      @demo.CodeResult("\
    @Thumbnail({
      image: @Img({ src: '...' }),
      url: '...'
    })",
    @Thumbnail({
      image: @Img({ src: img1 }),
      url: '#'
    })),

      @demo.CodeResult("\
    @Thumbnail({
      image: @Img({ src: '...' }),
      caption: [
        @H3('Caption'),
        @P('...'),
        @P([
          @Button('Yes'),
          ' ',
          @Button('No')
        ])
      ]
    })",
    @Thumbnail({
      image: @Img({ src: img2 }),
      caption: [
        @H3('Caption'),
        @P('...'),
        @P([
          @Button('Yes'),
          ' ',
          @Button('No')
        ])
      ]
    })),

      @demo.CodeResult("\
    @Thumbnail({
      image: @Img({ src: '...' }),
      url: '...'
      caption: [
        @H3('Caption'),
        @P('...'),
        @P([
          @Button('Yes'),
          ' ',
          @Button('No')
        ])
      ]
    })",
    @Thumbnail({
      image: @Img({ src: img2 }),
      url: '#',
      caption: [
        @H3('Caption'),
        @P('...'),
        @P([
          @Button('Yes'),
          ' ',
          @Button('No')
        ])
      ]
    }))
    ]);
*/
exports.Thumbnail = function (settings) {
  var image   = null;
  var caption = null;
  var classes = [];

  image = settings.image;

  if (settings.url != null) {
    image = base_html.A(image, { 'href': settings.url });
  }

  if (settings.caption == null) {
    image = image ..@Class('thumbnail');

  } else {
    classes.push('thumbnail');

    caption = base_html.Div(settings.caption, { 'class': 'caption' });
  }

  return base_html.Div([image, caption]) ..@Style('display: inline-block') ..@Class(classes);
};


/**
  @function PageHeader
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary <div class="page-header"><h1>{content}</h1></div>
  @return {surface::Element}
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    [
      @PageHeader('This is a page header.'),
      @P('This is a normal paragraph.')
    ]",
    [
      @PageHeader('This is a page header.'),
      @P('This is a normal paragraph.')
    ]),

      @demo.CodeResult("\
    [
      @PageHeader(`This is a page header with ${@Small('small text')}.`),
      @P('This is a normal paragraph.')
    ]",
    [
      @PageHeader(`This is a page header with ${@Small('small text')}.`),
      @P('This is a normal paragraph.')
    ])
    ]);
*/
exports.PageHeader = (content, attribs) -> callWithClass(@html.Div, 'page-header', `<h1>$content</h1>`, attribs);

/**
  @function Panel
  @summary Bootstrap-style panel ("<div class='panel'>") with additional `panel-*` classes applied.
  @param {surface::HtmlFragment} [content]
  @param {optional String} [panel_classes='default'] String of `panel-*` classes to apply to the button
  @return {surface::Element}
  @desc
    `panel_classes` is a space-separated list of `panel-*` classes that should be applied to the
    panel:

    * **context**: `default`, `primary`, `success`, `info`, `warning`, or `danger`

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Panel('default', [
      'Nothing'
    ])",
    @Panel('default', [
      'Nothing'
    ])),

      @demo.CodeResult("\
    @Panel('default', [
      @PanelBody('Body')
    ])",
    @Panel('default', [
      @PanelBody('Body')
    ])),

    @demo.CodeResult("\
    @Panel('default', [
      @PanelHeading('Heading')
    ])",
    @Panel('default', [
      @PanelHeading('Heading')
    ])),

    @demo.CodeResult("\
    @Panel('default', [
      @PanelFooter('Footer')
    ])",
    @Panel('default', [
      @PanelFooter('Footer')
    ])),

      @demo.CodeResult("\
    @Panel('default', [
      @PanelHeading(@PanelTitle('Heading')),
      @PanelBody('Body'),
      @PanelFooter('Footer')
    ])",
    @Panel('default', [
      @PanelHeading(@PanelTitle('Heading')),
      @PanelBody('Body'),
      @PanelFooter('Footer')
    ])),

    @demo.CodeResult("\
    @Panel('primary', [
      @PanelHeading(@PanelTitle('Primary heading')),
      @PanelBody('Primary body'),
      @PanelFooter('Primary footer')
    ])",
    @Panel('primary', [
      @PanelHeading(@PanelTitle('Primary heading')),
      @PanelBody('Primary body'),
      @PanelFooter('Primary footer')
    ])),

    @demo.CodeResult("\
    @Panel('success', [
      @PanelHeading(@PanelTitle('Success heading')),
      @PanelBody('Success body'),
      @PanelFooter('Success footer')
    ])",
    @Panel('success', [
      @PanelHeading(@PanelTitle('Success heading')),
      @PanelBody('Success body'),
      @PanelFooter('Success footer')
    ])),

    @demo.CodeResult("\
    @Panel('info', [
      @PanelHeading(@PanelTitle('Info heading')),
      @PanelBody('Info body'),
      @PanelFooter('Info footer')
    ])",
    @Panel('info', [
      @PanelHeading(@PanelTitle('Info heading')),
      @PanelBody('Info body'),
      @PanelFooter('Info footer')
    ])),

    @demo.CodeResult("\
    @Panel('warning', [
      @PanelHeading(@PanelTitle('Warning heading')),
      @PanelBody('Warning body'),
      @PanelFooter('Warning footer')
    ])",
    @Panel('warning', [
      @PanelHeading(@PanelTitle('Warning heading')),
      @PanelBody('Warning body'),
      @PanelFooter('Warning footer')
    ])),

    @demo.CodeResult("\
    @Panel('danger', [
      @PanelHeading(@PanelTitle('Danger heading')),
      @PanelBody('Danger body'),
      @PanelFooter('Danger footer')
    ])",
    @Panel('danger', [
      @PanelHeading(@PanelTitle('Danger heading')),
      @PanelBody('Danger body'),
      @PanelFooter('Danger footer')
    ])),

    @demo.CodeResult("\
    @Panel('default', [
      @PanelHeading(@PanelTitle('Table example')),
      @PanelBody([
        'This is a table contained inside a panel:'
      ]),
      @Table([
        @Tr([
          @Td('foo'),
          @Td('1')
        ]),
        @Tr([
          @Td('bar'),
          @Td('2')
        ])
      ])
    ])",
    @Panel('default', [
      @PanelHeading(@PanelTitle('Table example')),
      @PanelBody([
        'This is a table contained inside a panel:'
      ]),
      @Table([
        @Tr([
          @Td('foo'),
          @Td('1')
        ]),
        @Tr([
          @Td('bar'),
          @Td('2')
        ])
      ])
    ])),

    @demo.CodeResult("\
    @Panel('default', [
      @PanelHeading(@PanelTitle('List Group example')),
      @PanelBody([
        'This is a list group contained inside a panel:'
      ]),
      @ListGroup([
        @ListGroupItem('foo'),
        @ListGroupItem('bar'),
        @ListGroupItem('qux'),
      ])
    ])",
    @Panel('default', [
      @PanelHeading(@PanelTitle('List Group example')),
      @PanelBody([
        'This is a list group contained inside a panel:'
      ]),
      @ListGroup([
        @ListGroupItem('foo'),
        @ListGroupItem('bar'),
        @ListGroupItem('qux'),
      ])
    ]))
    ]);
*/
exports.Panel = function(content, panel_classes) {
  if (!panel_classes) panel_classes = 'default';
  return callWithClasses(@html.Div, ['panel'].concat(prefixClasses(panel_classes, 'panel-')),
    content);
};


/**
  @function ButtonGroup
  @summary Bootstrap (`<div class="btn-group">`)
  @param {Array} [buttons]
  @param {Object} [settings]
  @setting {String} [label] The label to use for assistive technologies
  @setting {optional String} [size] Must be either `"lg"`, `"sm"`, or `"xs"`
  @setting {optional String} [direction="horizontal"] Must be either `"horizontal"` or `"vertical"`
  @setting {optional Boolean} [justified=false] Whether the button group should stretch to fill its container
  @return {surface::Element}
  @desc
    See also http://getbootstrap.com/components/#btn-groups.

  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);
    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', size: 'xs' })",
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', size: 'xs' })),

      @demo.CodeResult("\
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', size: 'sm' })",
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', size: 'sm' })),

      @demo.CodeResult("\
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo' })",
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo' })),

      @demo.CodeResult("\
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', size: 'lg' })",
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', size: 'lg' })),

      @demo.CodeResult("\
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', direction: 'vertical' })",
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', direction: 'vertical' })),

      @demo.CodeResult("\
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', justified: true })",
    @ButtonGroup([
      @Button('Foo'),
      @Button('Bar'),
      @Button('Qux')
    ], { label: 'foo', justified: true }))
    ]);
*/
function wrapButtonGroup(buttons, classes) {
  // TODO handle Streams and other stuff
  return buttons ..@map(x -> base_html.Div(x) ..@Attrib('role', 'group') ..@Class(classes));
}

exports.ButtonGroup = function (buttons, settings) {
  var outer_classes = [];
  var inner_classes = ['btn-group'];

  if (settings.direction == null) {
    settings.direction = 'horizontal';
  }
  if (settings.justified == null) {
    settings.justified = false;
  }

  if (settings.size != null) {
    var size = 'btn-group-' + settings.size;
    outer_classes.push(size);
    inner_classes.push(size);
  }

  if (settings.direction === 'vertical') {
    outer_classes.push('btn-group-vertical');
  } else {
    outer_classes.push('btn-group');
  }

  if (settings.justified) {
    outer_classes.push('btn-group-justified');
  }

  return base_html.Div(wrapButtonGroup(buttons, inner_classes))
    ..@Class(outer_classes)
    ..@Attrib('role', 'group')
    ..@Attrib('aria-label', settings.label);
};


/**
  @function PanelBody
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary <div class="panel-body">
  @return {surface::Element}
  @desc
    See [::Panel] for examples
*/
exports.PanelBody = wrapWithClass(@html.Div, 'panel-body');

/**
  @function PanelFooter
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary <div class="panel-footer">
  @return {surface::Element}
  @desc
    See [::Panel] for examples
*/
exports.PanelFooter = wrapWithClass(base_html.Div, 'panel-footer');

/**
  @function PanelHeading
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary <div class="panel-heading">
  @return {surface::Element}
  @desc
    See [::Panel] for examples
*/
exports.PanelHeading = wrapWithClass(@html.Div, 'panel-heading');

/**
  @function PanelTitle
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary <h3 class='panel-title'>
  @return {surface::Element}
  @desc
    See [::Panel] for examples
*/
exports.PanelTitle = wrapWithClass(@html.H3, 'panel-title');

//----------------------------------------------------------------------
// FORMS

/**
  @function InlineForm
  @summary XXX write me
*/
exports.InlineForm = content -> @html.Div(content, {'class':'form-inline'});

/**
  @function HorizontalForm
  @summary XXX write me
*/
exports.HorizontalForm = content -> @html.Div(content, {'class':'form-horizontal'});

/**
  @function FormGroup
  @summary XXX write me
*/
exports.FormGroup = (content) -> 
  @html.Div(content, {'class': 'form-group'}) .. 
  @Mechanism(function(node) {
    var field = node .. @field.getField();
    if (!field) return;
    var state = 'unknown';
    field .. @field.validationState() .. @each {
      |validation|
      if (state == validation.state) continue;
      node.classList.remove("has-#{state}");
      state = validation.state;
      node.classList.add("has-#{state}");
    }
  });

/**
  @function ControlLabel
  @summary XXX write me
*/
exports.ControlLabel = (content) -> @html.Label(content, {'class':'control-label'});


//----------------------------------------------------------------------
// HIGH-LEVEL BOOTSTRAP-SPECIFIC CONSTRUCTS:


/**
   @function SelectInput
   @summary XXX write me
   @param {Object} [settings]
   @setting {Function} [suggestions] function search_term_stream -> suggestions_stream
   @setting {HTML} [extra_buttons] 
   @desc
     suggestions can be a stream of arrays of strings or objects:
      { text:String, highlight:Boolean }
*/


function ElemClass(elem,cls) { 
  return content -> @Element(elem, content, {'class':cls})
}

var InputGroup      = ElemClass('div','input-group');
var InputGroupBtn   = ElemClass('span', 'input-group-btn');
var Caret           = ElemClass('span', 'caret');
var DropdownMenuRight = content -> @html.Ul(content,{'class':'dropdown-menu pull-right'});

// helper to format suggestions:
function format_suggestion(s, filter_term) {
  if (typeof s === 'string' || typeof s === 'number') {
    s = { text: s }
  }

  if (typeof s.text !== 'string')
    s.text = String(s.text);

  var markup = s.text;

  var index = markup.indexOf(filter_term);
  if (index == -1) {
    // suggestion is not really applicable; grey out
    markup = @html.Span(markup, {style:'color:grey'});
  }
  else
    markup = `${markup.substr(0,index)}$@html.Em(filter_term)${markup.substr(index+filter_term.length)}`;

  if (s.highlight)
    markup = @html.Strong(markup);

  return  markup .. @html.A({href:'#'}) .. @Prop('txt', s.text);
}

var SelectInput = function(settings) {
  // untangle arguments:
  if (settings .. @isSequence) {
    settings = {suggestions: settings};
  }
  else if (typeof settings === 'function') {
    settings = {suggestions: settings};
  }
  else {
    settings = 
      { 
        suggestions : [],
        txtToVal: null,
        valToTxt: null,
        extra_buttons: undefined
      } .. @override(settings);
  }


  var dropdown = [exports.Btn('default', 
                              Caret(), 
                              {'class':'dropdown-toggle', type:'button','data-toggle': 'dropdown'}),
                  DropdownMenuRight(
                    // XXX need to get at value here; could pass in as property on the stream receiver ('r')
                    @Stream(function(r) {
                      var suggestions;
                      if (settings.suggestions .. @isSequence)
                        suggestions = settings.suggestions;
                      else // function implied
                        suggestions = settings.suggestions(/*XXX value*/);
                      
                      if (suggestions .. @isStream) {
                        suggestions .. @each { |x| 
                          if (!@isSequence(x))
                            x = [x];
                          r(x .. @map(s -> format_suggestion(s,'XXX value')));
                        }
                      }
                      else { // array implied
                        r(suggestions .. @map(s -> format_suggestion(s,'XXX value')));
                      }
                    })
                  ) .. 
                  @On('click', 
                      {
                        transform: ev -> { node: @dom.findNode('a', ev.target, ev.currentTarget),
                                           ev: ev },
                        filter: {node} -> !!node,
                        handle: {ev} -> @dom.preventDefault(ev)
                      },
                      function({node}) {
                        // XXX distinguish between contextual and non-contextual SelectInputs
                        var field = (node .. @field.getField())[@field.CTX_FIELD];
                        @dom.findNode('.input-group', node).firstChild.value = node.txt;
                        var val = node.txt;
                        if (settings.txtToVal)
                          val = val .. settings.txtToVal;
                        field.auto_validate.set(true);
                        field.value.set(val);
                      }
                     )
                 ];
  
  if (settings.extra_buttons)
    dropdown[0] = dropdown[0] .. @Style('border-radius:0px');

  var rv = 
    InputGroup(
      [
        @html.TextInput(settings) ..
          @On('input', 
              ev -> ev.target.parentNode.querySelector('.input-group-btn').classList.add('open')),
        InputGroupBtn([
          dropdown,
          settings.extra_buttons
        ])
      ]
    );
      
  return rv;
};
exports.SelectInput = SelectInput;

/**
  @function doModal
  @altsyntax doModal(body, [settings], block)
  @altsyntax doModal([settings]) { |dialog| ... }
  @param {Object} [settings]
  @param {Function} [block] Function bounding lifetime of dialog; will be called with DOM node of dialog as first argument.
  @return {Object} `undefined` if the dialog is dismissed with the close button, by clicking on the backdrop or typing 'Escape', otherwise equal to the return value of `block`
  @setting {surface::HtmlFragment} [body]
  @setting {optional surface::HtmlFragment} [header] Content of header. Takes precedence over `title` if both are given.
  @setting {optional surface::HtmlFragment} [title] Title to display in a `<h4 class='modal-title'>` in the header.
  @setting {optional Boolean} [close_button=true] Show a close button in the header. Only takes effect if `header` or `title` is given.
  @setting {optional surface::HtmlFragment} [footer]
  @setting {optional Boolean|String} [backdrop=true] Include a modal-backdrop element. Specify `'static'` for a backdrop that doesn't close the modal on click.
  @setting {optional Boolean} [keyboard=true] Close the modal when Escape key is pressed.
  @summary Execute function `block` while showing a modal dialogbox
  @desc
    * "Close events", such as a click on the `close_button`, or a press of the Escape key, will abort `block`, and can be handled inside `block` with a [sjs:#language/syntax::try-retract] construct.
  @hostenv xbrowser
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    function launch() {
      var Countdown = @ObservableVar(10);
      var Status = @ObservableVar(`Ignition in $Countdown seconds`);
      @doModal({
        title: `Rocket Launch`,
        body: Status .. @H2() .. @TextCenter,
        footer: @Btn('primary', 'Abort') .. @Enabled(Countdown) .. @OnClick({|| return})
      }) {
        ||
        for (var i=9; i>=0; --i) {
          hold(1000);
          Countdown.set(i);
        }
        Status.set('Engines started');
        hold(1000);
        Status.set('Rocket launched');
        hold();
      }
    }

    @mainContent .. @appendContent([
      @demo.CodeResult(
        "\
      @ = require(['mho:std', 'mho:app']);

      function launch() {
        var Countdown = @ObservableVar(10);
        var Status = @ObservableVar(`Ignition in $Countdown seconds`);

        @doModal({
          title: `Rocket Launch`,
          body: Status .. @H2() .. @TextCenter,
          footer: @Btn('primary', 'Abort') ..
                    @Enabled(Countdown) ..
                    @OnClick({|| return})
        }) {
          ||
          for (var i=9; i>=0; --i) {
            hold(1000);
            Countdown.set(i);
          }
          Status.set('Engines started');
          hold(1000);
          Status.set('Rocket launched');
          hold();
        }
      }

      @mainContent .. @appendContent(
        @Btn('primary', 'Launch Rocket') .. @OnClick(launch)
      );\

      ",
        [@Btn('primary', 'Launch Rocket') .. @OnClick(launch),
         @Div() .. @Style('height:300px')]
      )
    ]);

*/
function doModal() {
  // untangle args:
  var settings = { close_button: true}, block;
  if (typeof arguments[0] === 'string' ||
      @isQuasi(arguments[0]) ||
      @isFragment(arguments[0]) ||
      Array.isArray(arguments[0])) {
    settings = settings .. @merge({body:arguments[0]});
    if (arguments.length > 2) {
      block = arguments[2];
      settings = settings .. @merge(arguments[1]);
    }
    else {
      block = arguments[1];
    }
  }
  else {
    settings = settings .. @merge(arguments[0]);
    block = arguments[1];
  }

  // build content:
  var content = `<div class='modal-body'>${settings.body}</div>`;

  if (!settings.header && settings.title)
    settings.header = `<h4 class='modal-title'>${settings.title}</h4>`;
  if (settings.header) {
    content = [`<div class='modal-header'>${settings.close_button? `<button type='button' class='close' data-dismiss='modal'>&times;</button>`}${settings.header}</div>`, content];
  }
  if (settings.footer) {
    content = [content, `<div class='modal-footer'>${settings.footer}</div>`];
  }

  // build options to pass to bootstrap's modal(.) init call:
  var bs_options = { backdrop: true,
                     keyboard: true,
                   } .. @override(settings);

  document.body .. @appendContent(
    `<div class='modal' tabindex='-1'>
      <div class='modal-dialog'>
        <div class='modal-content'>
          $content
        </div>
      </div>
     </div>`) {
    |dialog|

    $(dialog).modal(bs_options);
    try {
      waitfor {
        return block(dialog);
      }
      or {
        waitfor() {
          $(dialog).on('hidden.bs.modal', resume);
        }
      }
    }
    finally {
      $(dialog).modal('hide');
    }
  }
}
exports.doModal = doModal;
