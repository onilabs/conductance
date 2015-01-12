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

@ = require(['sjs:object', 'sjs:sequence', '../../surface', 'sjs:quasi']);

/**
  @nodoc
  @noindex
  (documented as mho:surface/bootstrap)
*/


//----------------------------------------------------------------------
// BASIC HTML ELEMENTS, SPECIALIZED WITH BS STYLES

var base_html = require('../html');

// export all elements from surface/html.sjs:

exports .. @extend(base_html);

// ... and override with bootstrap specializations:

// XXX there has to be a better way to set the classes here
__js function wrapWithClass(baseElement, cls) {
  return () -> baseElement.apply(null, arguments) .. @Class(cls);
}

__js function callWithClass(baseElement, cls, content, attribs) {
  return baseElement.call(null, content, attribs) .. @Class(cls);
}

// XXX use of @Class this way is undocumented, but works
// for an array of non-observable class names
var wrapWithClasses = wrapWithClass;
var callWithClasses = callWithClass;

/**
  @function Button
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled button (`<button class="btn btn-default">`)
  @return {surface::Element}
  @desc
    * See also [::Btn] for creating buttons with more style choices.
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Button('Click me')",
        @Button('Click me')
      )]);


*/
exports.Button = wrapWithClasses(base_html.Button, ['btn', 'btn-default']);

/**
  @function Table
  @param {surface::HtmlFragment} [content]
  @param {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled table (`<table class="table">`)
  @return {surface::Element}
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Table([
      @Tr([
        @Td('foo'),
        @Td('bar')
      ]),
      @Tr([
        @Td('qux'),
        @Td('corge')
      ])
    ])",
    @Table([
      @Tr([
        @Td('foo'),
        @Td('bar')
      ]),
      @Tr([
        @Td('qux'),
        @Td('corge')
      ])
    ]))
    ]);
*/
exports.Table = wrapWithClass(base_html.Table, 'table');

/**
  @function Input
  @summary Bootstrap-styled input (`<input class="form-control">`)
  @param  {String} [type]
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar], then `value` will
    be updated to reflect any manual changes to the element's value.
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var Items = @generate(Math.random) ..
      @transform(x -> (hold(1000), Math.round(x*100)));

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @Input('text', 'foo')",
    @Input('text', 'foo')),

      @demo.CodeResult("\
    var Items = @ObservableVar(0);
    ...
    @Input('text', Items)",
    @Input('text', Items))
    ]);
*/
exports.Input = wrapWithClass(base_html.Input, 'form-control');

/**
  @function TextInput
  @summary Bootstrap-styled [surface/html::TextInput] (with class "form-control")
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar], then `value` will
    be updated to reflect any manual changes to the element's value.
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var Items = @generate(Math.random) ..
      @transform(x -> (hold(1000), Math.round(x*100)));

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @TextInput('foo')",
    @TextInput('foo')),

      @demo.CodeResult("\
    var Items = @ObservableVar(0);
    ...
    @TextInput(Items)",
    @TextInput(Items))
    ]);
*/
exports.TextInput = wrapWithClass(base_html.TextInput, 'form-control');

/**
  @function TextArea
  @param  {String|sjs:sequence::Stream|sjs:observable::ObservableVar} [value]
  @param  {optional Object} [attrs] Hash of additional DOM attributes to set on the element
  @summary Bootstrap-styled textarea (`<textarea class="form-control">`)
  @return {surface::Element}
  @desc
    When the element is inserted into the document, its value
    will be set to `value`. If `value` is a [sjs:sequence::Stream], the
    element's value will be updated every time `value` changes. If (in addition)
    `value` is an [sjs:observable::ObservableVar],
    then `value` will be updated to reflect any manual changes to the element's value.
  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var Items = @generate(Math.random) ..
      @transform(x -> (hold(1000), Math.round(x*100)));

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    @TextArea('foo')",
    @TextArea('foo')),

      @demo.CodeResult("\
    var Items = @ObservableVar(0);
    ...
    @TextArea(Items)",
    @TextArea(Items))
    ]);
*/
exports.TextArea = wrapWithClass(base_html.TextArea, 'form-control');

/**
  @function Select
  @param  {Object} [settings] Widget settings
  @setting {Boolean} [multiple=false] Whether or not this is a multi-selection widget
  @setting {Array|sjs:sequence::Stream} [items] Selectable items
  @setting {sjs:observable::ObservableVar} [selected] Optional ObservableVar that will be synchronized to selected item(s).
  @return {surface::Element}
  @summary Bootstrap-styled [surface/html::Select] (with class "form-control")
  @demo
    @ = require(['mho:std','mho:app',{id:'./demo-util', name:'demo'}]);

    var options = ["Bad", "Ok", "Pretty Good", "Perfect"];
    var Rating  = @ObservableVar('Pretty Good');


    @mainContent .. @appendContent(
       @demo.CodeResult("\
    @ = require(['mho:std','mho:app']);

    var options = ['Bad', 'Ok', 'Pretty Good', 'Perfect'];
    var Rating  = @ObservableVar('Perfect');

    @mainBody .. @appendContent(`
      Rate Conductance:
      $@Select({items:options, selected: Rating})
      Your Rating: $Rating`);",
          `Rate Conductance:  $@Select({items:options, selected: Rating})
           Your Rating: $Rating`
    ));
*/
exports.Select = wrapWithClass(base_html.Select, 'form-control');


/**
  @function Progress
  @summary Bootstrap (`<div class="progress"><div class="progress-bar"></div>`)
  @param {Number|sjs:sequence::Stream} [value]
  @param {optional Object} [settings]
  @setting {optional Boolean} [showPercentage=false] Whether to show the % number or not
  @setting {optional Number} [min=0] Lowest value of `value`
  @setting {optional Number} [max=100] Highest value of `value`
  @setting {optional Boolean} [stripes=true] Whether to show stripes or not
  @setting {optional Boolean|sjs:sequence::Stream} [stripesAnimate=true] Whether to animate the stripes or not
  @setting {optional String|sjs:sequence::Stream} [style="default"] Can be `"default"`, `"success"`, `"info"`, `"warning"`, or `"danger"`
  @return {surface::Element}
  @desc
    See also http://getbootstrap.com/components/#progress.

    ----

    If `value` is a [sjs:sequence::Stream], then the % completed will
    change over time to match the stream.

    If `settings.style` is a [sjs:sequence::Stream], then the style
    will change over time to match the stream.

    If `settings.stripesAnimate` is a [sjs:sequence::Stream], then it will
    turn on/off stripe animation depending on the value of the stream.


  @demo
    @ = require(['mho:std', 'mho:app', {id:'./demo-util', name:'demo'}]);

    var percent = @ObservableVar(0);
    var animate = @ObservableVar(true);

    var style = percent ..@transform(function (x) {
      if (x < 20) {
        return 'danger';
      } else if (x < 40) {
        return 'warning';
      } else if (x < 60) {
        return 'info';
      } else if (x < 80) {
        return 'default';
      } else {
        return 'success';
      }
    });

    spawn @generate(Math.random) ..@each(function (x) {
      percent.set(x * 100);
      hold(2000);
    });

    spawn (function () {
      while (true) {
        hold(4000);
        if (animate.get()) {
          animate.set(false);
        } else {
          animate.set(true);
        }
      }
    })();

    @mainContent .. @appendContent([
      @demo.CodeResult("\
    var percent = @ObservableVar(0);
    var animate = @ObservableVar(true);

    var style = percent ..@transform(function (x) {
      if (x < 20) {
        return 'danger';
      } else if (x < 40) {
        return 'warning';
      } else if (x < 60) {
        return 'info';
      } else if (x < 80) {
        return 'default';
      } else {
        return 'success';
      }
    });

    ...

    @Progress(percent, { stripesAnimate: animate, style: style })",
    @Progress(percent, { stripesAnimate: animate, style: style })),

      @demo.CodeResult("\
    [
      @Progress(10),
      @Progress(20, { showPercentage: true }),
      @Progress(30, { stripesAnimate: false }),
      @Progress(40, { stripes: false }),
      @Progress(50, { style: 'success' }),
      @Progress(60, { style: 'info' }),
      @Progress(70, { style: 'warning' }),
      @Progress(80, { style: 'danger' })
    ]",
    [
      @Progress(10),
      @Progress(20, { showPercentage: true }),
      @Progress(30, { stripesAnimate: false }),
      @Progress(40, { stripes: false }),
      @Progress(50, { style: 'success' }),
      @Progress(60, { style: 'info' }),
      @Progress(70, { style: 'warning' }),
      @Progress(80, { style: 'danger' })
    ])
    ]);
*/
// TODO code duplication with HTML5 Progress
function computePercentage(value, min, max) {
  return ((value - min) / (max - min)) * 100;
}

// TODO I don't think `isStream` is the right predicate to use
exports.Progress = function (value, settings) {
  // TODO is there a utility to handle this ?
  if (settings == null) {
    settings = {};
  }
  if (settings.showPercentage == null) {
    settings.showPercentage = false;
  }
  if (settings.min == null) {
    settings.min = 0;
  }
  if (settings.max == null) {
    settings.max = 100;
  }
  if (settings.stripes == null) {
    settings.stripes = true;
  }
  if (settings.stripesAnimate == null) {
    settings.stripesAnimate = true;
  }
  if (settings.style == null) {
    settings.style = 'default';
  }

  // TODO is there a better way to do this ?
  if (@isStream(value)) {
    value = @mirror(value);
  } else {
    value = [value];
  }

  if (!@isStream(settings.stripesAnimate)) {
    settings.stripesAnimate = [settings.stripesAnimate];
  }

  if (!@isStream(settings.style)) {
    settings.style = [settings.style];
  }

  var percentage = base_html.Span() ..@Mechanism(function (node) {
    value ..@each(function (value) {
      var percent = computePercentage(value, settings.min, settings.max);
      var rounded = Math.round(percent);
      node.textContent = "#{rounded}%";
    });
  });

  if (!settings.showPercentage) {
    percentage = percentage ..@Class('sr-only');
  }

  var top = base_html.Div(percentage)
    ..@Class('progress-bar')
    ..@Attrib('role', 'progressbar')
    ..@Attrib('aria-valuemin', '' + settings.min)
    ..@Attrib('aria-valuemax', '' + settings.max)
    ..@Mechanism(function (node) {
      waitfor {
        value ..@each(function (value) {
          var percent = computePercentage(value, settings.min, settings.max);
          node.setAttribute('aria-valuenow', '' + value);
          node.style.width = "#{percent}%";
        });
      } and {
        if (settings.stripes) {
          settings.stripesAnimate ..@each(function (animate) {
            if (animate) {
              node.classList.add('active');
            } else {
              node.classList.remove('active');
            }
          });
        }
      } and {
        settings.style ..@each(function (style) {
          node.classList.remove('progress-bar-success');
          node.classList.remove('progress-bar-info');
          node.classList.remove('progress-bar-warning');
          node.classList.remove('progress-bar-danger');

          if (style !== 'default') {
            node.classList.add('progress-bar-' + style);
          }
        });
      }
    });

  if (settings.stripes) {
    top = top ..@Class('progress-bar-striped');
  }

  return base_html.Div(top) ..@Class('progress');
};
