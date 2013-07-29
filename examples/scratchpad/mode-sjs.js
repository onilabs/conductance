// SJS mode for the ACE editor
ace.define('ace/mode/sjs', function(require, exports, module) {

	var oop = require("ace/lib/oop");
	var JSMode = require("ace/mode/javascript").Mode;
	var Tokenizer = require("ace/tokenizer").Tokenizer;
	var SJSHighlightRules = require("ace/mode/sjs_highlight_rules").SJSHighlightRules;

	var Mode = function() {
		var highlighter = new SJSHighlightRules();
		this.$tokenizer = new Tokenizer(highlighter.getRules());
		this.$keywordList = highlighter.$keywordList;
	};
	Mode.prototype = new JSMode();
	(function() {
		// disable jshint
		this.createWorker = function(session) {
			return null;
		}
	}).call(Mode.prototype);

	exports.Mode = Mode;

});

ace.define('ace/mode/sjs_highlight_rules', function(require, exports, module) {
	var JavaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;
	var TextHighlightRules = require("ace/mode/text_highlight_rules").TextHighlightRules;
	var oop = require("ace/lib/oop");

	var SJSHighlightRules = function() {
		window._RULES = this;
		var parent = new JavaScriptHighlightRules();
		var escapedRe = "\\\\(?:x[0-9a-fA-F]{2}|" + // hex
			"u[0-9a-fA-F]{4}|" + // unicode
			"[0-2][0-7]{0,2}|" + // oct
			"3[0-6][0-7]?|" + // oct
			"37[0-7]?|" + // oct
			"[4-7][0-7]?|" + //oct
			".)";
		this.$rules = parent.$rules;
		this.$rules.no_regex = [
			{
				token: "keyword",
				regex: "(waitfor|or|and|collapse|spawn|retract)\\b"
			},
			{
				token: "variable.language",
				regex: "(hold|default)\\b"
			},
			{
				token: "bstring",
				regex: "`",
				next: "bstring"
			},
			{
				token: "qqstring",
				regex: '"',
				next: "qqstring"
			}
		].concat(this.$rules.no_regex);

		this.$rules.bstring = [
			{
				token : "constant.language.escape",
				regex : escapedRe
			}, {
				token : "string",
				regex : "\\\\$",
				next: "bstring"
			}, {
				token : "string",
				regex : "`",
				next: "no_regex"
			}, {
				defaultToken: "string"
			}
		];

		this.$rules.qqstring = [
			{
				token : "constant.language.escape",
				regex : escapedRe
			}, {
				token : "string",
				regex : "\\\\$",
				next: "qqstring"
			}, {
				token : "string",
				regex : '"',
				next: "no_regex"
			}, {
				defaultToken: "string"
			}
		];
	}
	oop.inherits(SJSHighlightRules, TextHighlightRules);

	exports.SJSHighlightRules = SJSHighlightRules;
});
