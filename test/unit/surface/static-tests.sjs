@ = require(['sjs:test/std', 'mho:std']);
@h = require('mho:surface/html');
toHtml = (w) -> @collapseHtmlFragment(w).getHtml();

@context("void elements", function() {
  @test("include no closing tag", function() {
    var content = @Element("div", [
      @Element("img", null, {"src":"test.png"}),
      @Element("br"),
    ]) .. toHtml();
    content .. @assert.eq('<div><img src="test.png"><br></div>');
  });

  @test("allow content argument to be skipped", function() {
    @Element("img", {"src":"test.png"}) .. toHtml() .. @assert.eq('<img src="test.png">');
    @h.Img({"src":"test.png"}) .. toHtml() .. @assert.eq('<img src="test.png">');
  });

  @test("throw an error if content is provided", function() {
    @assert.raises( -> @h.Img("content"));
    @assert.raises( -> @h.Img("content", {"src":"test.png"}));
    @assert.raises( -> @h.Img("", {src: "test.png"}));
  });
});
