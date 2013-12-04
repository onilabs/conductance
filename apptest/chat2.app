@ = require(['mho:std', 'app:std']);

var name = @Observable('minion');
var API = @Observable(null);
var lastMessages = [];

var ui = API .. @transform(function(api) {
  var messages;
  if(api) {
    messages = api.messages;
  } else {
    messages = [lastMessages];
  }
  return `
    <h1>Oni Labs Chat</h1>
    ${
      messages ..
        @transform(function(list) {
          lastMessages = list;
          return list .. @map({name,msg} -> `<div><i>${name}</i>: ${msg}</div>`);
        })
     }
    <hr>
    <div class='row'>
      <div class='col-md-2'>
        ${
           // name input
           // XXX fix observable-to-value binding
           @Input('', {type:'text'}) .. @Mechanism({
             |node|
             waitfor {
               name .. @each {
                 |val|
                 if (node.value !== val) node.value = val;
               }
             }
             and {
               node .. @when('keyup') {
                 |ev|
                 name.set(node.value);
               }
             }
           })
                                                     
         }
      </div>
      <div class='col-md-10'>
        ${api ? (
           // message input
           // XXX clean this up
           @Input('', {type:'text'}) ..@Mechanism({
             |node|
             node.focus();
             node .. @when('keyup', {filter: ev -> ev.keyCode === 13}) {
               |ev|
               api.writeMessage(name.get(), node.value);
               node.value = '';
             }
           })
         )}
      </div>
    </div>
    `
});

waitfor {
  @withAPI('./chat1.api') {|api|
    try {
      API.set(api);
      hold();
    } finally {
      API.set(null);
    }
  }
} or {
  @mainContent .. @withWidget(ui, -> hold());
}
