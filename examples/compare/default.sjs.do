#!/usr/bin/env sjs
// vim: set syntax=sjs:
@ = require('./build');

var source = @target + '.in';
@run('redo-ifchange', [source]);
console.log("var lib = require('./lib');");
console.log("var samples = lib.Samples();");

//XXX: hacks:
console.log("@ = require('mho:stdlib');");
console.log("var {@Input, @TextInput, @UnorderedList, @Button} = require('mho:surface/html');");
console.log("@appendWidget = (elem, w) -> elem .. @withWidget(w, ->hold());");

var contents = @fs.readFile(source, 'utf-8');

contents = contents.replace(/#+ (.*)/g, function(match, title) {
	return "samples.add(#{JSON.stringify(title)});";
});

contents = contents.replace(/```(.*)\n((?:\s|\S)+?)```/g, function(match, lang, content) {
	var includeSrc = @target === 'ui-samples.sjs';
	var highlighted = @highlight(content, lang);
	var code = highlighted.code;

	if (includeSrc) {
		// include actual source code too:
		code += "\nsamples.addImpl(function(container) {\n#{content}});";
	}
	return code;
});

contents .. console.log();
console.log('module.exports = samples;');

@run('redo-ifchange', ['code.css']);
