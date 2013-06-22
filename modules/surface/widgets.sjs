var { Widget, Mechanism } = require('./html');
var { HostEmitter, Stream } = require('sjs:events');
var { each } = require('sjs:sequence');

//----------------------------------------------------------------------

var Div = content -> Widget('div', content);
exports.Div = Div;

//----------------------------------------------------------------------

var TextInput = value ->
  Widget('input') ..
  Mechanism(function(node) {
    node.value = value.get();
    waitfor {
      value.observe {
        |v|
        if (node.value !== v)
          node.value = v;
      }
    }
    and {
      HostEmitter(node, 'input') .. Stream .. each {
        |ev|
        value.set(node.value);
      }
    }
  });
exports.TextInput = TextInput;