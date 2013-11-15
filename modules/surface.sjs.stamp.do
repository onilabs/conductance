#!/usr/bin/env conductance
// vim: syntax=sjs:
@ = require('sjs:std');
@docutil = require('sjs:docutil');

var [, , stamp] = @argv();
var target = 'surface.sjs';

var contents = @fs.readFile(target, 'utf-8');

var MARKER = '\n// GENERATED DOCS FOLLOW:\n'
var contentEnd = contents.indexOf(MARKER);
if (contentEnd != -1) {
  contents = contents.slice(0, contentEnd);
}
var modules = ['surface/base.sjs', 'surface/dynamic.sjs', 'surface/static.sjs'];

var unindent = (s) -> s.replace(/^\n+/, '') .. @unindent;

var docComments = modules
  .. @map(f -> @fs.readFile(f, 'utf-8'))
  .. @map(@docutil.extractDocComments)
  .. @concat
  .. @filter(comment -> !
    ( comment .. @contains('@nodoc') ||
      comment .. @contains('@noindex')
    ))
  .. @transform(unindent);

var output = contents + MARKER + "
/**
#{docComments .. @join("\n")}
*/
";
@fs.writeFile(stamp, output);
@fs.writeFile(target, output);

var proc = @childProcess.launch('redo-stamp', [], {'stdio':['pipe', null, null]});
proc.stdin .. @write(output);
proc.stdin.end();
proc .. @childProcess.wait();
