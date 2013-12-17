window.onerror = function(e) { rainbow.hide(); alert(e);};
rainbow.config({barColors: {'0': '#b9090b'}, barThickness: 2, shadowBlur: 0, });
window.onload = function() { rainbow.show(); };
