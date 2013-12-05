var { Widget, withWidget, Mechanism, Style, OnClick } = require('mho:surface');
var { Input, Form, Button } = require('mho:surface/bootstrap/html');
var { each, map, transform } = require('sjs:sequence');
var { Observable } = require('mho:observable');
var events = require('sjs:events');
var assert = require('sjs:assert');
var { remove } = require('sjs:array');
var ui = require('./ui');

exports.run = function(elem, libraryCollection, defaultHubs, onReady) {
  var libraries = libraryCollection.val;
  ui.withOverlay() {||
    var currentLibraryEntries = libraries .. transform(list -> list.map(function(lib) {
      var removeButton = Button('remove') .. OnClick( -> libraryCollection.remove(lib));
      var [name, url] = lib;
      return `
        <li>
          ${removeButton}
          ${ui.Hub(name)}
          <span>${url}</span>
        </li>
      `;
    }));

    currentLibraries = currentLibraryEntries .. transform((entries) -> entries.length ? `
      <h2>Current hubs</h2>
      <ul>$entries</ul>
    `);

    var disabledLibraries = libraries .. transform(function(libs) {
      var missing = defaultHubs.slice();
      libs .. each {|lib|
        missing .. remove(lib[0]);
      }

      var items = missing .. map(function(name) {
        return `
          <li>
            ${Button('restore') .. OnClick( -> libraryCollection.add(name))}
            ${ui.Hub(name)}
          </li>
        `;
      });
      if (items.length == 0) return undefined;

      return `<h3>Disabled hubs</h3>
        <ul>$items</ul>
      `;
    });

    var formError = Observable();
    var addForm = Form(`
      ${Widget("div", formError) .. ui.errorText}
      <div>
        <label>Name: </label><input/>
      </div>
      <div>
        <label>URL: </label><input/>
      </div>
      $Button("Add")
    `) .. Mechanism(function(elem) {
      while(true) {
        var e;
        waitfor {
          e = elem.getElementsByTagName('button')[0] .. events.wait('click');
        } or {
          e = elem .. events.wait('submit');
        }
        e.preventDefault();
        var [name, url] = elem.getElementsByTagName('input') .. map(i -> i.value);
        try {
          libraryCollection.add(name, url);
          // clear inputs
          elem.getElementsByTagName('input') .. each(i -> i.value = "");
          formError.set();
        } catch(e) {
          formError.set(`<strong>Error:</strong> ${e.message}`);
        }
      }
    }) .. Style("
      input, label { display:inline-block; }
      label { min-width: 5em; }
      button { margin-left:5em; }
    ");

    var widget = Widget("div", `
      ${Button('x') .. Style("{float:right;}")}
      ${currentLibraries}

      ${disabledLibraries}

      <h3>Custom hub</h3>
      ${addForm}
    `, {'class': 'config'})
    .. Style("
      { position: absolute;
        left: 0;
        top:0;
        margin:2em 5%;
        padding: 2em 5%;
        width:80%;
        background: #fff;
      }

      h3 { margin-top:1em; }

      li {
        list-style-type: none;
      }

      li button {
        margin-right: 1em;
      }
      
      button {
        margin-top:0.2em;
      }
    ");
    elem .. withWidget(widget) {|elem|
      if (onReady) onReady();
      elem.getElementsByTagName("button")[0] .. events.wait('click');
    }
  }
};
