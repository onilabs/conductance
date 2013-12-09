@ = require(['sjs:test/std', 'mho:std']);
@h = require('mho:surface/html');
toHtml = (w) -> @collapseHtmlFragment(w).getHtml();

@context("void elements") {||
  @test("include no closing tag") {||
    var content = @Widget("div", [
      @Widget("img", null, {"src":"test.png"}),
      @Widget("br"),
    ]) .. toHtml();
    content .. @assert.eq('<div><img src="test.png"><br></div>');
  }

  @test("allow content argument to be skipped") {||
    @Widget("img", {"src":"test.png"}) .. toHtml() .. @assert.eq('<img src="test.png">');
    @h.Img({"src":"test.png"}) .. toHtml() .. @assert.eq('<img src="test.png">');
  }

  @test("throw an error if content is provided") {||
    @assert.raises( -> @h.Img("content"));
    @assert.raises( -> @h.Img("content", {"src":"test.png"}));
    @assert.raises( -> @h.Img("", {src: "test.png"}));
  }
}
