// Conductance version of http://knockoutjs.com/examples/helloWorld.html

var { ObservableVar } = require('sjs:observable');
var { appendContent } = require('mho:surface');
var { Input } = require('mho:surface/html');

//----------------------------------------------------------------------

var firstName = ObservableVar("Planet");
var lastName  = ObservableVar("Earth");

document.body .. appendContent(
    `
     <p>First name: $Input(firstName)</p>
     <p>Last name:  $Input(lastName) </p>
     <h2>Hello, $firstName $lastName!</h2>
    `
);
