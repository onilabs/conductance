window.run = function(code) {
  try {
    require('sjs:sys').eval("(function() { #{code}\nresize();\n })()", {filename:"demo_code"}) 
  }
  catch (e) {
    document.body.innerHTML = "Error in demo code. See console for details.";
    console.log("Error in demo code:
----------------------------------
#{code}
----------------------------------
Error message:
#{e}
");
  }
};
