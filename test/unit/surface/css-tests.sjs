@ = require('sjs:test/std');
@css = require('mho:surface/css');

@context("scope", function() {
  var rule1 = "{ content: 'rule 1'; background-image:url('rule1.png'); }";
  var rule2 = "{ content: 'rule 2' }";
  var mediaQuery = (sel) -> "@media(max-width=800px) { #{sel} { content: 'narrow'; background-image:url('narrow.png'); } }";

  var cleanup = (str) -> str.trim().replace(/\s+/g, " ");
  var scope = ->
    @css.scope.apply(@css, arguments) .. cleanup;

  @test("leaves @global rules untouched", function() {
    scope("@global { div #{rule1} }", "parent")
      .. @assert.eq("div #{rule1}");
  });

  @test("allows an empty scope", function() {
    scope("
      .foo { div #{rule1} }", "")
    .. @assert.eq(".foo div #{rule1}");
  });

  @test("allows top level rules", function() {
    scope("
      { div #{rule1} }", "foo")
    .. @assert.eq(".foo div #{rule1}");
  });

  @test("disallows top level rules with no scope", function() {
    @assert.raises(-> scope("{content: 'test'; }", ""));
  });

  @test("recursively scopes rules", function() {
    scope("
      .foo {
        div #{rule1}
        .bar, span .baz {
          div #{rule2}
        }
      }", "parent")
    .. @assert.eq("
        .parent .foo div #{rule1}
        .parent .foo .bar div, .parent .foo span .baz div #{rule2}
      " .. cleanup);
  });

  @test("doesn't duplicate media queries that contain multiple blocks", function() {
    scope("
      @media(foo) {
        pre #{rule1}
        div #{rule2}
      }", "parent")
    .. @assert.eq("
      @media(foo) {
        .parent pre #{rule1}
        .parent div #{rule2}
      }" .. cleanup);
  });

  @test("scopes nested CSS blocks (eg media queries)", function() {
    scope("
      #{mediaQuery("&.main")}
      .foo {
        #{mediaQuery("pre")}
        #{mediaQuery("@global { body")} }
      }", "parent")
    .. @assert.eq("
        #{mediaQuery(".parent.main")}
        #{mediaQuery(".parent .foo pre")}
        #{mediaQuery("body")}
      " .. cleanup);
  });

  @test("combines & rules with parent prefixes", function() {
    scope("
      .foo {
        div #{rule1}
        .bar, &.baz {
          div #{rule2}
        }
      }", "parent")
    .. @assert.eq("
        .parent .foo div #{rule1}
        .parent .foo .bar div, .parent .foo.baz div #{rule2}
      " .. cleanup);
  });

});
