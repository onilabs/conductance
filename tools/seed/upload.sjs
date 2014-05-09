#!/usr/bin/env conductance
@ = require('mho:std');
@stream = require('sjs:nodejs/stream');
@crypto = require('nodejs:crypto');
var [file] = @argv();
@assert.ok(file);

@logging.setLevel(@logging.INFO); // TESTING

var withReadStream = function(file, block) {
  if (file == '-') {
    var stream = process.stdin;
    waitfor {
      throw(stream .. @wait('error'));
    } or {
      waitfor {
        stream .. @wait('close');
      } and {
        try {
          block(stream);
        } finally {
          stream.destroy();
        }
      }
    }
  } else {
    @fs.withReadStream(file, block);
  }
};

require('http://localhost:7079/deploy.api').connect {|api|
  var serverPubkey = null;
  var dh = @crypto.getDiffieHellman('modp5');
  dh.generateKeys();
  var expectedKey = null; // TODO
  var hmac = null;
  var cipher = null;

  var app = api.deploy('main', {
    handshake: function(opts) {
      //dhKey: dhKeys['public'],
      //signature: sign(dhKeys['public'], serverCredentials['private']),
      //publicKey: serverCredentials['public'],
      //users: authorizedKeys,
      @info("server presented details: #{JSON.stringify(opts)}");
      
      var sshAgent = new (require('ssh-agent'))();
      waitfor (var err, identities) {
        sshAgent.requestIdentities(resume);
      }
      if(err) throw err;

      // find the first identity that appears in the opts.users list
      var allowedUsers = opts .. @get('users');
      var identity;
      var userIndex;
      allowedUsers .. @indexed .. @each {|[idx, user]|
        @info(`checking for identity: $user`);
        var found = identities .. @find((id) ->
          // XXX `data` seems to be base64 encoded - is this guaranteed, or should we decode it first?
          user.type == id.type && user.data == id.ssh_key
        );
        if (found) {
          identity = found;
          userIndex = idx;
          break;
        }
      }

      if(!identity) {
        throw new Error("SSH agent provided no identities that the server accepts");
      }
      @info("Using SSH key:", identity);


      var serverDhKey = new Buffer(opts.dhKey);
      if (expectedKey !== null) {
        @assert.fail("TODO: validate expected host key");
      } else {
        @warn("Blindly tusting server's public key");
      }
      var ephemeralSecret = dh.computeSecret(serverDhKey);
      // XXX it is probably fine to use the same secret for both purposes, but check...
      hmac = @crypto.createHmac('sha256', ephemeralSecret);
      cipher = @crypto.createCipher('aes256', ephemeralSecret);
      // to prove our identity to the server (and set up HMAC), we
      // respond with our EDH key, which user we are, and the
      // signature of our EDH key (signed by private key)
      var plaintext = dh.getPublicKey();
      waitfor (var err, signature) {
        sshAgent.sign(identity, dh.getPublicKey(), resume);
      }
      if(err) throw err;
      return {
        userIndex: userIndex, // shorthand for sending back the key
        publicKey: dh.getPublicKey(),
        signature: signature.signature,
      };
    },

    stream: @Stream(function(emit) {
      hmac .. @assert.ok("HMAC not yet initialized");
      cipher .. @assert.ok("Cipher not yet initialized");
      var lastTime = 0;

      withReadStream(file) {|stream|
        var i=0;
        var chunk;
        var chunks=[];
        var send = function(chunk) {
          if (chunks.length > 0) {
            console.log("[> chunk #{i}: #{chunks.length}]");
            console.log("[= chunk #{i++}: #{chunks.length}]");
            emit(Buffer.concat(chunks));
            chunks = [];
          }
        };
        waitfor {
          // pump stream into cipher
          stream .. @stream.pump(cipher);
          cipher .. @stream.end();
        } and {
          // emit cipher text, while pumping it through the MAC
          while(true) {
            chunk = cipher .. @stream.read();

            if (chunk == null) {
              console.log("EOF");
              send();
              break;
            }
            chunks.push(chunk);
            hmac .. @stream.write(chunk);

            var now = Date.now();
            if (Math.abs(now - lastTime) > 200) {
              // if last round-trip was less than 200ms ago, keep accumulating
              lastTime = now;
              send();
            }
          }
        }
      }
      console.log("all pieces sent");
    }),

    digest: -> hmac.digest(),
  })
  console.log(`uploaded app ${app}`);
}
