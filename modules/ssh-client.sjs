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

@ = require([
  'sjs:std',
  {id:'ssh2', name: 'Connection'}, 'sjs:shell-quote',
  {id:'sjs:nodejs/stream', name:'stream'},
  {id:'sjs:nodejs/child-process', name:'childProcess'},
]);

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
  
  // each `exec` call adds a `close` listener, which can cause spurious warnings
  // if the default max is left at 10
  connection.setMaxListeners(0);

  waitfor {
    var err = connection .. @wait('error');
    throw err;
  }
  or {
    try {
      connection .. @wait('ready');
      block(connection);
      connection.end();
    }
    finally {
      if (connection.__oni_sftpsession)
        connection.__oni_sftpsession.end();
      // NOTE: don't use connection.end(), as
      // that can throw an uncaught error if we're
      // in the process of throwing an earlier error
      connection.destroy();
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

        - The readable side represents stdout (which `block` can read from using e.g. [sjs:nodejs/stream::contents].
        
        - The writable side represents stdin (which `block` can write to using e.g. [sjs:nodejs/stream::pump]).
        
        - ChannelStream has a `stderr` property that represents the stream of output from stderr.

        - An `'exit'` event will be emitted when the process finishes (which `block` can wait on using [sjs:event::wait]).

*/

/**
   @function exec
   @altsyntax connection .. exec(command, [options]) { |stream| ... }
   @summary Execute a shell string on an SSH server
   @return {void|Object}
   @param {::Connection} [connection] SSH server connection
   @param {String} [command] Command to execute
   @param {optional Object} [settings]
   @param {optional Function} [block]
   @desc
     This function is just like [::run], except that it takes a single
     shell string rather than a command and array of arguments. See [::run]
     for a description of the available `settings`.

     If your command includes any interpolated data, you must take care to
     escape it properly. It's usually better to use [::run] instead, which
     will take care of this for you as long as you're connecting to an
     `sh`-compatible shell..
*/
function exec(conn, command, opts, block) {
  return run(conn, command, null, opts, block);
}
exports.exec = exec;


function _processStdio(options, block) {
  var rv = @childProcess._processStdio(options, block);
  // Unlike child-process, we can't pass raw FDs or nodejs streams as-is.
  // So wrap those, too:
  rv.stdio .. @indexed .. @each {|[i, io]|
    var stream;
    if(io && typeof(io) === 'object' && (
      io .. @hasOwn('fd')
      || typeof(io.read) === 'function'
      || typeof(io.write) === 'function'
    )) {
      stream = io;
    } else if(typeof(io) === 'number') {
      stream = [process.stdin, process.stdout, process.stderr][io];
      if(!stream) {
        throw new Error("Non-stdio FD: #{io}");
      }
    }
    if(stream) {
      var conv = i === 0
        ? pumpFrom(stream)
        : pumpTo(stream);
      rv.conversions.push([i, conv]);
    }
  }
  return rv;
}

var pumpTo = dest -> stream -> stream .. @stream.pump(dest, {end: false});
var pumpFrom = contents -> function(stream) {
  // when pumping from `process.stdin`, it's normal for the command to exit
  // before `contents` is fully consumed, so just retract the pump when
  // the process exits.
  waitfor {
    stream .. @wait('exit');
  } or {
    if(contents === process.stdin) {
      // see https://github.com/joyent/node/issues/17204
      console.warn("WARN: cannot inherit stdin across SSH streams due to nodejs bug. Ignoring.");
      hold();
    }
    contents .. @stream.pump(stream);
  }
};

var CommandFailed = exports._CommandFailed = function(child) {
  var e = new Error(@childProcess._formatCommandFailed(child.code, null, child._command));
  e.childProcessFailed = true;
  e.code = child.code;
  e.stdio = child.stdio;
  @childProcess._stdioGetters .. @each {|[k,g]|
    Object.defineProperty(e, k, {get: g});
  }
  return e;
};

var exposedStdio = function(spec, val) {
  // for command streams, we only expose `pipe` types.
  // string, buffer & ignore values are not necessary
  if(spec === 'pipe') return val;
  return null;
}

function kill(stream) {
  // XXX has no effect on OpenSSH; see
  // https://bugzilla.mindrot.org/show_bug.cgi?id=1424
  // XXX also: using it causes "write EPIPE" on connection end,
  // so it's disabled for now
  //stream.signal('INT');

  stream.destroy();
}

/**
   @class RemoteCommand
   @summary A remote SSH command
   @desc
     The type of this object's `stdin`, `stdout` and `stderr` fields will depend
     on the `stdio` options passed to the [::run] or [::exec] function which created it,

   @variable RemoteCommand.code
   @type Number|Null
   @summary The exit code of the command

   @variable RemoteCommand.stdin
   @type Stream|String|Buffer|Null

   @variable RemoteCommand.stdout
   @type Stream|String|Buffer|Null

   @variable RemoteCommand.stderr
   @type Stream|String|Buffer|Null


   @function run
   @altsyntax connection .. run(command, [options]) { |stream| ... }
   @summary Run a command on an SSH server
   @return {void|Object}
   @param {::Connection} [connection] SSH server connection
   @param {String} [command] Command to execute
   @param {optional Object} [settings]
   @param {optional Function} [block] Function for interacting with the command execution (see description below).
   @setting {Array|String} [stdio] Child's stdio configuration (see below for more details)
   @setting {Boolean} [throwing=true] Throw an error when the child process returns a nonzero exit status
   @setting {String} [encoding="utf-8"] Encoding of stdout / stderr data when using `'string'` output
   @setting {Object} [env] An environment to use for the execution of the command.
   @setting {Boolean|Object} [pty] Set to true to allocate a pseudo-tty with defaults, or an object containing specific
                                   pseudo-tty settings (see https://github.com/onilabs/ssh2).
   @setting {Boolean|Integer|Object} [x11] Set to true to use defaults, a number to specify a specific screen number,
                                     or an object with custom properties (see https://github.com/onilabs/ssh2).
   @return {::RemoteCommand}
   @desc

     For consistency, this function acts as much as possible like the [sjs:nodejs/child-process::run] function.
     Options with the same name have the same effect, but not all [sjs:nodejs/child-process::run] options are
     accepted by this function (and vice versa).

     Due to differences between SSH execution and native process spawning, there are some minor differences in behaviour:

      - file descriptors are supported as `stdio` values, but only for `0`, `1` and `2` (not arbitrary file decriptors)
      - arbitrary nodejs streams are supported as `stdio` values (not just those with an `fd` property)
      - signal codes are not reported. If the command is killed by a signal or other abnormal exit,
        its `code` property will be `null` (and an error raised, unless `throwing` is false)
      - Depending on the SSH server, some output may be truncated in the case of a failed command (if the `exit` event
        fires before all output has been collected).
      - This function builds a `sh`-compatible string using [sjs:shell-quote::] to escape the `command` and
        `arguments` passed. If the SSH server does not run a `sh`-compatible shell, you should use [::exec]
        and perform your own escaping.

*/
function run(conn, command, args, opts, block) {
  var err, stream;
  // untangle args
  if (typeof(opts) == 'function') {
    block = opts;
    opts = undefined;
  }
  if(!opts) opts = {};

  if (args !== null) {
    command = @quote(args === null ? command : [command].concat(args));
  }

  var throwing = opts.throwing !== false;
  var { stdio, conversions: stdioConversions } = _processStdio(opts, block);

  delayed_retract(
    function() {
      waitfor(err,stream) { conn.exec(command, opts, resume) }
    },
    function() {
      if (!err) {
        stream .. kill();
      }
    }
  );

  if (err) throw err;
  var child = Object.create(stream);
  child.code = null;
  child._command = command; // used in exceptions
  var rawStdio = [
    stream.stdin,
    stream.stdout,
    stream.stderr,
  ];
  child.stdio = [
    exposedStdio(stdio[0], stream.stdin),
    exposedStdio(stdio[1], stream.stdout),
    exposedStdio(stdio[2], stream.stderr),
  ];
  @childProcess._stdioGetters .. @each {|[k, get]|
    Object.defineProperty(child, k, {get: get});
  }

  var err, ioErr, abort = @Condition(), ioComplete = @Condition(), awaitingIO = @Condition();
  var stdioReplacements = [];
  try {
    waitfor {
      waitfor {
        if(block) {
          waitfor {
            block(child);
          } or {
            // XXX this should not be necessary - the branch should already
            // be retracted by the outer waitfor/or
            abort.wait();
          }
        }
      } and {
        try {
          waitfor {
            child.code = stream .. @wait('exit');
          } or {
            stream .. @wait(['finish']);
            awaitingIO.set();
            ioComplete.wait();
            if(throwing) {
              throw new Error("SSH connection terminated");
            } else {
              child.code = -1;
            }
          }
          if(throwing && child.code !== 0) {
            throw CommandFailed(child);
          }
        } catch(e) {
          if(!err) err = e;
          abort.set();
          // don't throw immediately; wait for stdio conversions to complete
        } retract {
          stream .. kill();
        }
      } and {
        if(stdioConversions.length > 0) {
          @waitforAll(function([i, conv]) {
            var dest = [i];
            try {
              waitfor {
                conv(rawStdio[i], dest);
              } or {
                abort.wait();
              } or {
                if(i === 2) {
                  // XXX ssh2's `stderr` stream never terminates in some situations,
                  // e.g dropped connection. So once the main channel has ended, we
                  // give `stderr` a 2s grace period and then just discard it.
                  awaitingIO.wait();
                  hold(2000);
                } else {
                  hold();
                }
              }
            } catch(e) {
              ioErr = e;
              if(!abort.isSet) {
                // if the child hasn't died yet, kill it to prevent deadlocks
                // (e.g. waiting for a process that is waiting for (failed) input)
                
                stream .. kill();
              }
              abort.set();
            } finally {
              if(dest[1] !== undefined) {
                stdioReplacements.push(dest);
              }
            }
          }, stdioConversions);
        }
        ioComplete.set();
      }
    } or {
      abort.wait();
    }
  } finally {
    stdioReplacements .. @each {|[i, v]|
      child.stdio[i] = v;
    }
  }

  if(err) {
    if(err.childProcessFailed) {
      if(typeof(child.stderr) === 'string') err.message += "\n#{child.stderr}"
    }
    throw err;
  }
  if(ioErr) throw ioErr
  return child;
}
exports.run = run;

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
    session = conn;
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
      stream .. @stream.contents .. @each(receiver);
    }
    finally {
      stream .. kill();
    }
  });
}
exports.fileStream = fileStream;

function writeFile(conn, path, contents, options){
  var session = conn..getSFTSession();
  var ws = session.createWriteStream(path, options);
  waitfor {
    var err  = ws .. @wait('error');
    throw err;
  } or {
    waitfor {
      ws .. @wait('close');
    } and {
      ws.write(contents);
      ws.end();
    }
  }
}
exports.writeFile = writeFile;

function readFile(conn, path, options){
  var session = conn..getSFTSession();
  var rs = session.createReadStream(path, options);
  var contents;
  waitfor {
    var err = rs .. @wait('error');
    throw err;
  } or {
    waitfor {
      rs .. @wait('close');
    } and {
      contents = rs .. @stream.readAll;
      rs.destroy();
    }
  }
  return contents.toString();
}
exports.readFile = readFile;

function mkdir(conn, dir){
  var session = conn .. getSFTSession();
  waitfor (err) {session.mkdir(dir, resume);}
  if (err) throw err;
}
exports.mkdir = mkdir

function unlink(conn, path){
  var session = conn .. getSFTSession();
  waitfor (err) {session.unlink(path, resume);}
  if (err) throw err;
}
exports.unlink = unlink
