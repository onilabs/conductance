window.run = function(code) { require('sjs:sys').eval("(function() { #{code}\nresize();\n })()", {filename:"demo_code"}) };
