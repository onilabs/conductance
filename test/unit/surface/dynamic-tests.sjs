var {test, context, assert} = require('sjs:test/suite');
context("dynamic") {||

var {withWidget, Widget} = require('mho:surface');
var {Observable, Computed} = require('mho:observable');
var {each, at} = require('sjs:sequence');

context("observable widget content") {||
  test("should reflect changes made before & after insertion") {||
    var content = Observable("first");
    var observableWidget = Widget("div", content);
    var cachedComputedWidget = Widget("div", Computed(content, c -> 'cached computed ' + c));
    var computedWidget = Widget("div", Computed.Always(content, c -> 'always computed ' + c));
    content.set("second");

    var widgets = [observableWidget, cachedComputedWidget, computedWidget];
    document.body .. withWidget(widgets) {|parent|
      var elems = parent.childNodes;
      elems.length .. assert.eq(widgets.length);

      elems .. each {|elem|
        elem.innerText.split(' ') .. at(-1) .. assert.eq("second");
      }

      content.set("third");

      elems .. each {|elem|
        elem.innerText.split(' ') .. at(-1) .. assert.eq("third");
      }
    };
  }
}

}.browserOnly();
