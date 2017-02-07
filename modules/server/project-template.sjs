/* (c) 2013-2017 Oni Labs, http://onilabs.com
 *
 * This file is part of Conductance, http://conductance.io/
 *
 * It is subject to the license terms in the LICENSE file
 * found in the top-level directory of this distribution.
 * No part of Conductance, including this file, may be
 * copied, modified, propagated, or distributed except
 * according to the terms contained in the LICENSE file.
 */

@ = require('mho:std');

/**
  @nodoc
*/

// get a sane path on windows:
function toPosixPath(p) {
  return require('path').resolve(p).replace(/\\/g, '/');
}

exports.getTemplateDescriptions = function() {
  return @fs.readFile(require.url("../../project-templates/index.txt") .. @url.toPath).toString();
};

exports.initProject = function(template_name) {
  // check that the template directory exists
  var template_dir = require.url("../../project-templates/#{template_name}/") .. @url.toPath;

  if (!@fs.isDirectory(template_dir))
    throw new Error("Unknown template '#{template_name}'");

  // check that the target directory is empty
  var target_dir = '.';
  if (@fs.readdir(target_dir).length > 0)
    throw new Error("Target directory is not empty!");

  // copy across files
  @childProcess.run('cp', [ '-r', (template_dir .. toPosixPath)+'/files/.',  target_dir .. toPosixPath ]);

  console.log("All done. Now run 'conductance serve'");
};

