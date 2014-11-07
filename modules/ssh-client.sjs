/* (c) 2013-2014 Oni Labs, http://onilabs.com
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
  @summary ssh client wrapping the https://github.com/mscdex/ssh2 library
  @hostenv nodejs
*/

@ = require(['sjs:std', {id:'ssh2', name: 'Connection'}]);

//----------------------------------------------------------------------
// helpers

// helper to gracefully handle cleanup of a resource when we're
// retracting during acquisition. 
// XXX This is useful for many nodejs libs that don't provide a way to
// abort acquisition, so it should go into some common library
function delayed_retract(uninterrupted_acquire, delayed_retract) {
  var resource = spawn uninterrupted_acquire();
  try {
    return resource.value();
  }
  retract {
    spawn delayed_retract(resource.value());
  }
}


//----------------------------------------------------------------------

/**
   @class Connection
   @summary https://github.com/onilabs/ssh2 `Connection` object
   @desc 
     Call [::connect] to create a Connection in a block context.
*/


/**
   @function connect
   @altsyntax connect(settings) { |conn| ... }
   @summary Establish an SSH connection
   @param {Objct} [settings]
   @param {Function} [block] Function that will be passed a [::Connection] object.
   @return {void}
   @setting {String} [host='localhost'] Hostname or IP address of server.
   @setting {Integer} [port=22] Port number of server.
   @setting {String} [hostHash]  'md5' or 'sha1'. The host's key is hashed using this method and passed to the `hostVerifier` function. 
   @setting {Function} [hostVerifier] Function that is passed a string hex hash of the host's key for verification purposes. Return true to continue with the connection, false to reject and disconnect. 
   @setting {String} [username] Username for authentication.
   @setting {String} [password] Password for password-based user authentication.
   @setting {String} [agent] Path to ssh-agent's UNIX socket for ssh-agent-based user authentication.
   @setting {String|Buffer} [privateKey] Private key for for key-based user authentication (OpenSSH format).
   @setting {String} [passphrase]  Passphrase to decrypt an encrypted private key. 
   @setting {String} [tryKeyboard=false] Try keyboard-interactive user authentication if primary user authentication method fails.
   @setting {Integer} [pingInterval=60000] How often (in milliseconds) to send keepalive packets to server.
   @setting {Integer} [readyTimeout=10000] How long (in milliseconds) to wait for the SSH handshake to complete.
   @setting {ReadableStream} [sock] A nodejs `ReadableStream` to use for communicating with the server instead of creating a new TCP connection (useful for connection hopping).
   @setting {Boolean} [agentForward=false] Whether to use OpenSSH agent forwarding.
   @desc
     Establishes an SSH connection to the given host and calls `block` with a [::Connection] object.
     When `block` exits (normally, by exception, or retraction), the connection will automatically be closed.

     See https://github.com/onilabs/ssh2 for more information on configuation paramters.

     #### Authentication method priorities:

         Password -> Private Key -> Agent -> Keyboard-interactive -> None
   
*/
function connect(parameters, block) {
  var connection = new @Connection();
  waitfor {
    var err = connection .. @wait('error');
    throw err;
  }
  or {
    try {
      connection .. @wait('ready');
      block(connection);
    }
    finally {
      if (connection.__oni_sftpsession)
        connection.__oni_sftpsession.end();
      connection.end();
    }
  }
  or {
    connection.connect(parameters);
    hold();
  }
}
exports.connect = connect;

//----------------------------------------------------------------------

/**
   @class ChannelStream
   @summary https://github.com/onilabs/ssh2 `ChannelStream` object
   @desc 
     - The interactive form of [::exec] passes a `ChannelStream` to its `block` function.
 
     - A ChannelStream is a normal nodejs 'streams2' duplex stream with the changes described at https://github.com/onilabs/ssh2. In particular:

        - The readable side represents stdout (which `block` can read from using [sjs:nodejs/stream::read] or [sjs:nodejs/stream::readAll]).
        
        - The writable side represents stdin (which `block` can write to using [sjs:nodejs/stream::write]).
        
        - ChannelStream has a `stderr` property that represents the stream of output from stderr. 

        - An `'exit'` event will be emitted when the process finishes (which `block` can wait on using [sjs:event::wait]).

*/

/**
   @function exec
   @altsyntax connection .. exec(command, [options]) { |stream| ... }
   @altsyntax var {stdout, stderr } = connection .. exec(command, [options])
   @summary Execute a command on an SSH server
   @return {void|Object}
   @param {::Connection} [connection] SSH server connection
   @param {String} [command] Command to execute
   @param {optional Object} [settings]
   @param {optional Function} [block] Function for interacting with the command execution (see description below). 
   @setting {Object} [env] An environment to use for the execution of the command.
   @setting {Boolean|Object} [pty] Set to true to allocate a pseudo-tty with defaults, or an object containing specific 
                                   pseudo-tty settings (see https://github.com/onilabs/ssh2).
   @setting {Boolean|Integer|Object} [x11] Set to true to use defaults, a number to specify a specific screen number,
                                     or an object with custom properties (see https://github.com/onilabs/ssh2).
   @desc
     #### Non-interactive form
     
     If `exec` is called without a `block` argument, then it will run
     the command to completion, accumulate all stdout and stderr
     produced by the command, and return an object 
     `{ stdout: String, stderr: String}`.

     #### Interactive form

     If `exec` is called with a `block` function, then `block` will be
     called with a [::ChannelStream], which allows `block` to read and
     write to the executing process. When `block` exits (normally, by
     exception or retraction), the stream will automatically be
     closed. If block exits normally, then `exec` will not return
     until the process has finished.

*/
function exec(conn, command, opts, block) {
  var err, stream;

  // untangle args
  if (arguments.length === 3 && typeof(opts) == 'function') {
    block = opts;
    opts = undefined;
  }


  delayed_retract(
    function() { 
      waitfor(err,stream) { conn.exec(command, opts, resume) } 
    },
    function() {          
      if (!err) {
        //            stream.signal('KILL'); XXX doens't seem to work
        stream.destroy(); 
      }
    }
  );

  if (err) throw err;
  
  if (block) {
    var exitStatus;
    waitfor {
      stream .. @wait('exit');
    }
    and {
      block(stream);
    }
    finally {
      stream.destroy();
    }
  }
  else {
    var stdout, stderr;
    waitfor {
      stdout = stream .. @readAll;
    }
    and {
      stderr = stream.stderr .. @readAll;
    }
    retract {
      //        stream.signal('KILL'); XXX doesn't seem to work
      stream.destroy();
    }
    return {stdout: stdout, stderr: stderr};
  }
}  
exports.exec = exec;

//----------------------------------------------------------------------

/**
   @class SFTPSession
   @summary https://github.com/onilabs/ssh2 `sftpconnection` object
   @desc 
     Call [::sftp] to create an SFTPSession object in a block context. 
     Alternatively, the sftp function (like [::readdir]) will create a 
     SFTPSession automatically if passed a [::Connection] instead of 
     an [::SFTPSession].
*/

function isSFTSession(obj) { return obj && obj.__oni_isSFTSession; }

/**
   @function sftp
   @altsyntax connection .. sftp { |session| ... }
   @summary Run an sftp session
   @return {SFTPSession}
   @param {::Connection} [connection] SSH server connection
   @param {Function} [block] Function which will be passed an [::SFTPSession]. 
          When `block` exits, the session will automatically be closed.
*/
function sftp(conn, block) {
  var err, session;
  delayed_retract(
    function() {
      waitfor(err,session) { conn.sftp(resume) }
    },
    function() {
      if (!err) session.end();
    });
  if (err) throw err;

  session.__oni_isSFTSession = true;


  // non-block form is only used internally (see readdir, etc) and
  // deliberately undocumented
  if (!block) return session;

  try {
    block(session);
  }
  finally {
    session.end();
  }
}
exports.sftp = sftp;

//----------------------------------------------------------------------

// helper for creating/retrieving an sftp session bounded to the
// connection:
function getSFTSession(conn) {
  var session;
  if (isSFTSession(conn))
    session = cont;
  else if (!(session = conn.__oni_sftpsession))
    session = conn.__oni_sftpsession = conn .. sftp();

  return session;
}

/**
   @class ATTRS
   @summary Plain JavaScript object specifying resource properties

   @variable ATTRS.mode
   @summary Mode/permissions of the resource (Integer)
   
   @variable ATTRS.uid 
   @summary User ID of the resource (Integer)

   @variable ATTRS.gid 
   @summary Group ID of the resouce (Integer)

   @variable ATTRS.size 
   @summary Size of the resource in bytes (Integer)

   @variable ATTRS.atime
   @summary UNIX timestamp of the access time of the resource (Integer)

   @variable ATTRS.mtime
   @summary UNIX timestamp of the modification time of the resource (Integer)
*/

/**
   @class Stat
   @inherit ::ATTRS
   @summary Object with resource properties and additional methods

   @function Stat.isDirectory
   @return {Boolean}
   @summary `true` if the resource is a directory

   @function Stat.isFile
   @return {Boolean}
   @summary `true` if the resource is a regular file

   @function Stat.isBlockDevice
   @return {Boolean}
   @summary `true` if the resource is a block device

   @function Stat.isCharacterDevice
   @return {Boolean}
   @summary `true` if the resource is a character device

   @function Stat.isFIFO
   @return {Boolean}
   @summary `true` if the resource is a FIFO

   @function Stat.isSocket
   @return {Boolean}
   @summary `true` if the resource is a socket
*/


/**
   @function readdir
   @summary Retrieve a directory listing via SFTP
   @param {::Connection|::SFTPSession} [connection] Connection or SFTP session
   @param {String} [path] Path to the directory
   @return {Array} Array of '{ filename: String, longname: String, attrs: [::Stat] }' objects
   @desc
   
     #### Notes on SFTP commands

     If `connection` is a [::Connection] object instead of an [::SFTPSession] then a shared
     SFTPSession with its lifetime bounded by the connection will be created if it 
     doesn't exist yet. This session will be shared by all subsequent sftp commands 
     on this connection that aren't called with a particular [::SFTPSession]. The shared
     session will be closed when the SSH connection terminates.
*/
function readdir(conn, path) {
  var session = conn .. getSFTSession();
  waitfor (var err, list) { 
    session.readdir(path, resume);
  }
  if (err) throw err;
  return list;
}
exports.readdir = readdir;


/**
   @function stat
   @summary Retrieve attributes of `path` via SFTP
   @param {::Connection|::SFTPSession} [connection] Connection or SFTP session
   @param {String} [path] Path 
   @return {::Stat} 
   @desc
     - See the *Notes on SFTP commands* in the documentation for [::readdir]

*/
function stat(conn, path) {
  var session = conn .. getSFTSession();
  waitfor (var err, rv) { 
    session.stat(path, resume);
  }
  if (err) throw err;
  return rv;
}
exports.stat = stat;

/**
   @function fileStream
   @summary Create a [sjs:sequence::Stream] of the given file's content retrieved via SFTP
   @param {::Connection|::SFTPSession} [connection] Connection or SFTP session
   @param {String} [path] Path to the file
   @param {optional Object} [settings]
   @setting {String} [encoding=null] null, 'utf8', 'ascii', or 'base64'
   @setting {Integer} [start=0] Byte position (zero-based) at which to start reading the file (inclusive)
   @setting {Integer} [end] Byte position (zero-based) at which to end reading the file (inclusive)
   @return {sjs:sequence::Stream} Stream of Strings or nodejs `Buffer`s, depending on encoding.
   @desc
      If encoding is `null`, then the returned stream will be comprised of nodejs 'Buffer' items. 
      For the other encodings, the stream is comprised of strings.

     - See the *Notes on SFTP commands* in the documentation for [::readdir]
      
*/
function fileStream(conn, path, options) {
  var session = conn .. getSFTSession();
  return @Stream(function(receiver) {
    try {
      var stream = session.createReadStream(path, options);
      var data;
      while ((data = @read(stream)) !== null)
        receiver(data);
    }
    finally {
      stream.destroy();
    }
  });
}
exports.fileStream = fileStream;

