/* (c) 2013-2019 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

/**
   @module  module-compiler
   @executable
   @summary SJS Module Compiler
   @desc
     Compiled SJS module files can be used as drop-in replacements for uncompiled files.

     There is a (slight) performance advantage to using compiled files (the VM can skip
     a compilation step when loading already-compiled modules).

     Compiled SJS module files are stripped of comments, and the generated code is *a lot* 
     harder (but not impossible) to read/understand than the corresponding uncompiled source, 
     so compilation can serve as a code obfuscation technique to discourage casual inspection 
     of source code.


   @function compile
   @summary  Compile an SJS module into equivalent compiled SJS code
   @param    {String} [src]
   @return   {String} Compiled SJS module source code
@docsoff */

@ = require([
  'sjs:std',
  'mho:commandline-utils',
  {id:'sjs:compile/deps.js', name:'deps'}
]);

var COMPILED_SRC_TAG = "/*__oni_compiled_sjs_1*/";

function compile(src) {

  var requires = [];
  @deps.compile(src) .. @each {
    |[name,args]| 
    if (name !== 'require') continue;
    var mods = @isArrayLike(args[0]) ? args[0] : [args[0]];
    mods .. @each {
      |mod|
      if (typeof mod === 'string')
        requires.push(mod);
      else if (mod && mod.id)
        requires.push(mod.id);
    }
  }

  var decls = '';
  if (requires.length) {
    decls = '\n/**\n' +
      requires .. @transform(mod -> "  @require #{mod}") .. @join('\n') +
      '\n*/\n';
  }

  return COMPILED_SRC_TAG + decls + __oni_rt.c1.compile(src, {globalReturn:true, 
                                                              filename:'__onimodulename'
                                                             }
                                                       );
};
exports.compile = compile;

if (require.main === module) {

  var args = @parseArgs({
    summary: "Compile an SJS module into equivalent compiled SJS code",
    args: [{name: 'file', help: 'SJS module file'}]
  });
  @fs.readFile(args.file, 'utf-8') .. compile({filename:args.file}) .. console.log;
}
