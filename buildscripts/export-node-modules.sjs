@ = require('sjs:std');
@browserify = require('nodejs:browserify');

//----------------------------------------------------------------------
// write msgpack module:
@fs.withWriteStream(@url.normalize('../modules/msgpack.sjs', module.id) .. @url.toPath) {
  |file|
  file.write("
/* ----------------------------------- *
* NOTE:                                *
*   This file is auto-generated        *
*   any manual edits will be LOST      *
*   (edit buildscrips/buildscript.sjs  *
*    instead)                          *
* ------------------------------------ */

/**
  @module msgpack
  @summary Browserified version of nodejs:@msgpack/msgpack 
  @desc
     See also https://github.com/msgpack/msgpack-javascript#readme and https://msgpack.org
*/
/**
  @function encode
  @summary See https://github.com/msgpack/msgpack-javascript#readme
*/
/**
  @class ENCODER
  @summary See https://github.com/msgpack/msgpack-javascript#readme
*/
/**
  @function decode
  @summary See https://github.com/msgpack/msgpack-javascript#readme
*/
/**
  @class DECODER
  @summary See https://github.com/msgpack/msgpack-javascript#readme
*/
__raw_until %%%
");



  var path = require.resolve('nodejs:@msgpack/msgpack').path;
  waitfor(var err, buf) {
    @browserify(path, {standalone:'msgpack'}).bundle(resume);
  }
  if (err) throw new Error(err);
  file.write(buf);
  file.write('\n%%%');
}
