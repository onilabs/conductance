// Conductance version of http://knockoutjs.com/examples/clickCounter.html

var { Observable, Computed } = require('mho:observable');
var { appendHtml, Attrib, Button, OnClick } = require('mho:surface');

//----------------------------------------------------------------------

var numberOfClicks = Observable(0);
var hasClickedTooManyTimes = Computed(numberOfClicks, x -> x>=3);

function registerClick() { numberOfClicks.set(numberOfClicks.get() + 1) }
function resetClicks()   { numberOfClicks.set(0) }

var clickedTooManyTimesWarning = Computed(
  hasClickedTooManyTimes,
  x -> x ? 
    `<div>
       That's too many clicks! Please stop before you wear out your fingers.
       ${ Button('Reset clicks') .. OnClick(resetClicks) }
     </div>` : '');

document.body .. appendHtml(
    `
      <div>You've clicked $numberOfClicks times</div>
      ${ Button('Click me') .. 
         OnClick(registerClick) .. 
         Attrib('disabled', hasClickedTooManyTimes) }
      $clickedTooManyTimesWarning
    `
);

