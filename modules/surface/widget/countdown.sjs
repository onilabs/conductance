@ = require('mho:surface');
exports.Countdown = function(seconds) {
  return @Widget('span', seconds) .. @Mechanism(function(node) {
    while (seconds > 0) {
      hold(1000);
      node.textContent = --seconds;
    }
  });
}

