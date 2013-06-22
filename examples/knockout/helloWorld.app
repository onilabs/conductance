// Conductance version of http://knockoutjs.com/examples/helloWorld.html

var { Observable } = require('mho:observable');
var { appendHtml, TextInput } = require('mho:surface');

//----------------------------------------------------------------------

var firstName = Observable("Planet");
var lastName  = Observable("Earth");

document.body .. appendHtml(
    `     
     <p>First name: $TextInput(firstName)</p> 
     <p>Last name:  $TextInput(lastName) </p>
     <h2>Hello, $firstName $lastName!</h2>
    `
);
