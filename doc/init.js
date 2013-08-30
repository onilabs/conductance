window.onerror = function(e) { rainbow.hide(); alert(e);};
rainbow.config({barColors: {'0': '#568'}, barThickness: 2, shadowBlur: 0, });
window.onload = function() { rainbow.show(); };
