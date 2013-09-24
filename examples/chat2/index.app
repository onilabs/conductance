@ = require('mho:stdlib');
@ .. @extend(require('mho:surface/bootstrap'));

//-------------------------------------------------------------
// backfill
@when = function(emitters, events, options, block) {
  if (block === undefined) {
    block = options;
    options = {};
  }

  var host_emitter = @HostEmitter(emitters, events, options.filter, options.transform);

  if (options.buffering) {
    using(var q = require('sjs:events').Queue(host_emitter)) {
      while (true) {
        block(q.get());
      }
    }
  }
  else {
    host_emitter .. require('sjs:events').Stream .. @each(block);
  }
};

//----------------------------------------------------------------------

var messages = @ObservableArray();
var name = @Observable('<Anonymous>');

var messagesView = messages .. @Map([name, msg] -> `<div><b>$name:</b> $msg</div>`);

var input = @TextInput() .. @Mechanism(function(inputCtrl) {
  inputCtrl.focus();
  inputCtrl .. @when('keydown') {
    |ev|
    if (ev.keyCode !== 13 || !inputCtrl.value.length) continue;
    messages.push([name, inputCtrl.value]);
    inputCtrl.value = '';
  }  
});

document.body .. @appendContent(
  `<h1>Oni Labs Chat demo</h1>
   $messagesView
   <hr>
   <div>
    $@TextInput(name): $input
   </div>`.. @Container .. @Bootstrap
);


messages.push(['test', 'hey']);
hold(1000);
messages.push(['test', 'how are you?']);

