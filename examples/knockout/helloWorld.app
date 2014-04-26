// Conductance version of http://knockoutjs.com/examples/helloWorld.html

var { ObservableVar } = require('sjs:observable');
var { appendContent } = require('mho:surface');
var { TextInput } = require('mho:surface/html');

//----------------------------------------------------------------------

var firstName = ObservableVar("Planet");
var lastName  = ObservableVar("Earth");

document.body .. appendContent(
    `
     <p>First name: $TextInput(firstName)</p>
     <p>Last name:  $TextInput(lastName) </p>
     <h2>Hello, $firstName $lastName!</h2>
    `
);
