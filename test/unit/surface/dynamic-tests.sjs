var {test, context, assert} = require('sjs:test/suite');
context("dynamic") {||

var {withWidget, Widget} = require('mho:surface');
var {Observable} = require('mho:observable');

context("observable widget content") {||
  test("should reflect changes made between construction & insertion time") {||
    var content = Observable("first");
    var widget = Widget("div", content);
    content.set("second");
    document.body .. withWidget(widget) {|elem|
      elem.innerText .. assert.eq("second");
    }
  }
}.skip("BROKEN");

}.browserOnly();
