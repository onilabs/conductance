var {test, context, assert} = require('sjs:test/suite');
context("dynamic") {||
@ =require(['sjs:test/std', 'mho:surface', 'sjs:sequence', 'sjs:observable', 'sjs:object', 'mho:surface/html']);

var {@ObservableVar, @observe} = require('sjs:observable');
@driver = require('sjs:xbrowser/driver');

var click = function(elem) {
  elem .. @driver.trigger('click');
  elem .. @driver.trigger('change');
}

context("void elements") {||
  test("should throw no errors") {||
    // testing for IE edge cases, mostly
    document.body .. @appendContent(@Element("img"), ->hold(100));
  }
}

context("block-scoped insertion method error handling") {||
  var cls = "should-be-removed";
  var content = @Element("div", [], {"class": cls});
  var expectedError = new Error("error thrown by mechanism");
  var throwyContent = @Element("div", [
    @Element("div", [], {'class':cls}) .. @Mechanism(function(elem) {
      elem.classList.contains(cls) .. @assert.ok(elem.getAttribute("class"));
      hold(100);
      throw Object.create(expectedError);
    })
  ], {'class':cls});

  test.beforeEach {|s|
    var div = @Element("div");
    [s.container] = document.body .. @appendContent(div);
    [s.containerFirst] = s.container .. @appendContent(div);
    [s.containerLast] = s.container .. @appendContent(div);
  }

  test.afterEach {|s|
    var remainingElements = document.querySelectorAll(".#{cls}");
    var length = remainingElements.length;
    @removeNode(s.container);
    @assert.eq(length, 0, "#{length} elements didn't get cleaned up!");
  }

  ;[
    ["appendContent", "container", 2],
    ["prependContent", "container", 0],
    ["replaceContent", "container", 0],
    ["insertBefore", "containerLast", 1],
    ["insertAfter", "containerFirst", 1],
  ] .. @each {|[method, subject, expectedIndex]|
    test(method) {|s|
      @assert.suspends( -> s[subject] .. @[method](content) {|elem|
        s.container.childNodes[expectedIndex] .. @assert.eq(elem);
        hold(10);
      });

      @assert.raises({inherits: expectedError},
        -> s[subject] .. @[method](throwyContent, -> hold(1000)));
      
      if (method .. @startsWith("replace")) {
        s.container.childNodes.length .. @assert.eq(0);
      } else {
        s.container.childNodes.length .. @assert.eq(2);
      }
    }
  }
}

context("observable widget content") {||
  test("should reflect changes made before & after insertion") {||
    var content = @ObservableVar("first");
    var observableElement = @Element("div", content);
    var computedElement = @Element("div", @observe(content, c -> 'computed ' + c));
    content.set("second");

    var widgets = [observableElement, computedElement];
    document.body .. @appendContent(widgets, function(/*elems ...*/) {
      var elems = arguments;
      elems.length .. assert.eq(widgets.length);

      elems .. @each {|elem|
        elem.textContent.split(' ') .. @at(-1) .. assert.eq("second");
      }

      content.set("third");

      elems .. @each {|elem|
        elem.textContent.split(' ') .. @at(-1) .. assert.eq("third");
      }
    });
  }
}

context("textarea widget") {||
  // textarea doesn't contain HTML, only values
  test("should contain contents") {||
    var obs = @ObservableVar("initial value");
    document.body .. @appendContent(@TextArea(obs)) {|elem|
      elem.value .. @assert.eq("initial value");
      obs.set("new value");
      hold(0);
      elem.value .. @assert.eq("new value");
    }
  }
}

context("select widget") {||
  var selectionMap = node -> node.childNodes .. @map(e -> e.selected);
  var withSelect = (settings, block) ->
      document.body .. @appendContent(@Select(settings), block);

  var commonTests = function() {
    test("should reflect static selections") {|s|
      withSelect({
        items: s.items,
        selected: "one",
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, false, false]);
      }
    }

    test("should read selection object changes") {|s|
      var selection = @ObservableVar("one");
      withSelect({
        items: s.items,
        selected: selection,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, false, false], "initial");
        selection.set("two");
        elem .. selectionMap .. assert.eq([false, true, false]);
      }

      selection.set(["one", "two"]);
      withSelect({
        items: s.items,
        multiple: true,
        selected: selection,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, true, false], "initial");
        selection.set(["two", "three"]);
        elem .. selectionMap .. assert.eq([false, true, true]);
      }
    }

    test("should store selection object changes") {|s|
      var selection = @ObservableVar("one");
      withSelect({
        items: s.items,
        selected: selection,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, false, false], "initial");
        elem.childNodes[1] .. click();
        selection.get() .. assert.eq("two");
        elem .. selectionMap .. assert.eq([false, true, false]);
      }

      selection.set(["one", "two"]);
      withSelect({
        items: s.items,
        multiple: true,
        selected: selection,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, true, false], "initial");
        elem.childNodes[1] .. click();
        elem .. selectionMap .. assert.eq([true, false, false]);
        selection.get() .. assert.eq(['one']);
      }
    }
  };

  context("plain items") {||
    test.beforeEach {|s|
      s.items = ["one", "two", "three"];
    }
    commonTests();
  }

  context("observable collection") {||
    test.beforeEach {|s|
      s.items = @ObservableVar(["one", "two", "three"]);
    }
    commonTests();

    test("should maintain single selection on item change") {|s|
      var selection = @ObservableVar("one");
      withSelect({
        items: s.items,
        selected: selection,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, false, false], "initial");
        s.items.set(["zero", "one"]);
        elem .. selectionMap .. assert.eq([false, true]);
      }
    }

    test("should maintain multiple selection on item change") {|s|
      var selection = @ObservableVar(["one", "two"]);
      withSelect({
        items: s.items,
        selected: selection,
        multiple: true,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, true, false], "initial");
        s.items.set(["zero", "one", "two", "three"]);
        elem .. selectionMap .. assert.eq([false, true, true, false]);
      }
    }

    test("should use latest selection on item change if selection is observable") {|s|
      var selection = @ObservableVar(["one", "two"]);
      withSelect({
        items: s.items,
        selected: selection,
        multiple: true,
      }) {|elem|
        elem .. selectionMap .. assert.eq([true, true, false], "initial");
        selection.set(["zero"]);
        elem .. selectionMap .. assert.eq([false, false, false], "initial");
        s.items.set(["zero", "one"]);
        elem .. selectionMap .. assert.eq([true, false]);
      }
    }
  }
}

@context("bootstrap wrappers") {||
  @bootstrap = require('mho:surface/bootstrap');
  var clsArray = function(elem) {
    var classes = elem.classList;
    var rv = [];
    for(var i=0; i<classes.length; i++) {
      if(classes[i] .. @startsWith("_oni_")) continue;
      rv.push(classes[i]);
    }
    return rv .. @sort();
  }
  var t = function(name, leadingArgs, tagname, extra_classes, extra_attrs) {
    @test(name) {||
      var content = "Content!";
      var attribs = {'class':"customClass1 customClass2", "name":"customName"};
      var elem = @bootstrap[name].apply(null, leadingArgs.concat([content, attribs]));
      extra_classes = (extra_classes == "" ? [] : extra_classes.split(" "));
      document.body .. @appendContent(elem) {|elem|
        elem.tagName.toLowerCase() .. @assert.eq(tagname);
        elem .. clsArray() .. @assert.eq(extra_classes.concat(["customClass1", "customClass2"]) .. @sort);
        elem.getAttribute("name") .. @assert.eq("customName");
        if(extra_attrs) {
          extra_attrs .. @ownPropertyPairs .. @each {|[k,v]|
            elem.getAttribute(k) .. @assert.eq(v);
          }
        }
      }
    }
  }

  t("Button", [], "button", "btn btn-default");
  t("Table", [], "table", "table");
  t("Row", [], "div", "row");

  // Input uses a different argument format
  // t("Input", [], "input", "form-control", {'type':'text'});
  t("TextArea", [], "textarea", "form-control");

  t("Btn", ['sm xs'], "button", "btn btn-sm btn-xs");
  t("Btn", [''], "button", "btn");
  t("Row", [], "div", "row");
  t("Col", [''], "div", "");
  t("Col", ['sm-2 sm-offset-1'], "div", "col-sm-2 col-sm-offset-1");
  t("Container", [], "div", "container");
  t("Lead", [], "p", "lead");
  t("ListGroup", [], "div", "list-group");
  t("PageHeader", [], "div", "page-header");

  // Panel uses a different argument format
  //t("Panel", ['success'], "div", "panel panel-success");

  t("PanelBody", [], "div", "panel-body");
  t("PanelHeading", [], "div", "panel-heading");
  t("PanelTitle", [], "h3", "panel-title");

  // XXX ListGroupItem?
  
  @test("Icon") {||
    document.body .. @appendContent(@bootstrap.Icon("foo", {name:"myIcon", "class":"cls1 cls2"})) {|elem|
      elem.tagName.toLowerCase() .. @assert.eq('span');
      elem.getAttribute("name") .. @assert.eq("myIcon");
      elem .. clsArray .. @assert.eq("glyphicon glyphicon-foo cls1 cls2".split(" ") .. @sort);
    }
  }
  @test("Input") {||
    document.body .. @appendContent(@bootstrap.Input({type:"checkbox", value:"initialVal", attrs:{name:"myIcon", "class":"cls1 cls2"}})) {|elem|
      elem.tagName.toLowerCase() .. @assert.eq('input');
      elem.value .. @assert.eq("initialVal");
      elem.getAttribute("name") .. @assert.eq("myIcon");
      elem.getAttribute("type") .. @assert.eq("checkbox");
      elem .. clsArray .. @assert.eq("cls1 cls2 form-control".split(" ") .. @sort);
    }
  }
}

}.browserOnly();
