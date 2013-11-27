@ = require('sjs:test/std');
@css = require('mho:surface/css');

@context("scope") {||
  var rule1 = "{ content: 'rule 1' }";
  var rule2 = "{ content: 'rule 2' }";

  var cleanup = (str) -> str.trim().replace(/\s+/g, " ");
  var scope = ->
    @css.scope.apply(@css, arguments) .. cleanup;

  @test("leaves @global rules untouched") {||
    scope("@global { div #{rule1} }", "parent")
      .. @assert.eq("div #{rule1}");
  }

  @test("allows an empty scope") {||
    scope("
      .foo { div #{rule1} }", "")
    .. @assert.eq(".foo div #{rule1}");
  }

  @test("recursively scopes rules") {||
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
  }

  @test("combines & rules with parent prefixes") {||
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
  }

}
