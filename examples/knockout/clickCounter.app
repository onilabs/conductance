// Conductance version of http://knockoutjs.com/examples/clickCounter.html

var { ObservableVar, observe } = require('mho:observable');
var { appendContent, Attrib, OnClick } = require('mho:surface');
var { Button } = require('mho:surface/html');

//----------------------------------------------------------------------

var numberOfClicks = ObservableVar(0);
var hasClickedTooManyTimes = observe(numberOfClicks, x -> x>=3);

function registerClick() { numberOfClicks.set(numberOfClicks.get() + 1) }
function resetClicks()   { numberOfClicks.set(0) }

var clickedTooManyTimesWarning = observe(
  hasClickedTooManyTimes,
  x -> x ?
    `<div>
       That's too many clicks! Please stop before you wear out your fingers.
       ${ Button('Reset clicks') .. OnClick(resetClicks) }
     </div>` : '');

document.body .. appendContent(
    `
      <div>You've clicked $numberOfClicks times</div>
      ${ Button('Click me') ..
         OnClick(registerClick) ..
         Attrib('disabled', hasClickedTooManyTimes) }
      $clickedTooManyTimesWarning
    `
);

