/* (c) 2014 Oni Labs, http://onilabs.com
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
  // TODO: document
  @nodoc
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
   @summary XXX write me
*/
function makeConnection(base_connection) {
  return {

    /**
       @function Connection.exec
       @summary XXX write me
     */
    exec: function(command, opts) {
      var err, stream;
      delayed_retract(
        function() { 
          waitfor(err,stream) { base_connection.exec(command, opts, resume) } 
        },
        function() {          
          if (!err) {
//            stream.signal('KILL'); XXX doens't seem to work
            stream.destroy(); 
          }
        }
      );

      if (err) throw err;

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
    },

    /**
       @function Connection.sftp
       @summary XXX write me
    */
    sftp: function(block) {
      var err, session;
      delayed_retract(
        function() {
          waitfor(err,session) { base_connection.sftp(resume) }
        },
        function() {
          if (!err) session.end();
        });
      if (err) throw err;

      try {
        block(makeSftpSession(session));
      }
      finally {
        session.end();
      }
    }
  }
}


/**
   @function connect
   @summary XXX write me
*/
function connect(parameters, block) {
  var base_connection = new @Connection();
  waitfor {
    var err = base_connection .. @wait('error');
    throw err;
  }
  or {
    try {
      base_connection .. @wait('ready');
      block(makeConnection(base_connection));
    }
    finally {
      base_connection.end();
    }
  }
  or {
    base_connection.connect(parameters);
    hold();
  }
}
exports.connect = connect;

//----------------------------------------------------------------------
// sftp

/**
   @class SftpSession
   @summary XXX write me
*/
function makeSftpSession(base_session) {
  return {
    /**
       @function readdir
       @summary XXX write me
     */
    readdir: function(dir) {
      waitfor(var err, list) { base_session.readdir(dir, resume); }
      if (err) throw err;
      return list;
    },
    /**
       @function read
       @summary
    */
    read: function(path, options) {
      return @Stream(function(receiver) {
        try {
          var stream = base_session.createReadStream(path, options);
          var data;
          while ((data = @read(stream)) !== null)
            receiver(data);
        }
        finally {
          stream.destroy();
        }
      });
    },
    stat: function(path) {
      waitfor(var err, rv) { base_session.stat(path, resume) }
      if (err) throw err;
      return rv;
    }
  };
}
