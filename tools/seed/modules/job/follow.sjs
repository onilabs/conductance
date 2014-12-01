@ = require('sjs:std');
@nodeFs = require('nodejs:fs');
exports.follow = function(path, encoding, sep) {
  sep = sep || '\n';
  return @Stream(function(emit) {
    var fd = null;
    var watcher = null;
    var close = function() {
      if (fd !== null) {
        @fs.close(fd);
        fd = null;
      }
      if (watcher !== null) {
        watcher.close();
        watcher = null;
      }
    };


    var change = @Emitter();
    var restart = @Emitter();
    while(true) {
      try {
        @assert.eq(watcher, null);
        try {
          watcher = @nodeFs.watch(path);
        } catch(e) {
          if (e.code !== 'ENOENT') throw e;
          // wait until the file exists
          @debug("file does not yet exist - waiting");
          waitfor() {
            @nodeFs.watchFile(path, resume);
          } finally {
            @nodeFs.unwatchFile(path, resume);
          }
          @debug("file created");
          continue; // recreate watcher
        }

        waitfor {
          restart .. @wait();
          @debug("restarting loop");
        } or {
          watcher .. @events('change') .. @each {|[type, _]|
            @debug("watcher event: #{type}");
            if (type === 'change') {
              change.emit();
            } else {
              // might be a rename - restart the entire loop
              restart.emit();
            }
          }
        } or {
          throw(watcher .. @wait('error'));
        } or {
          var buf = '';
          var startPos = 0;
          var lines = [];
          @assert.eq(fd, null);

          @info("opening #{path}");
          fd = @fs.open(path, 'r');
          emit(null); // let client know logs have rotated

          while(true) {
            try {
              var newSize = @fs.stat(path).size;
            } catch(e) {
              break;
            }
            if (newSize < startPos) {
              @debug("file has been truncated (to #{newSize}b)");
              break;
            }

            @debug("stream picking up from file offset #{startPos}");
            var stream = @fs.createReadStream(path, {
              fd: fd,
              encoding: encoding,
              autoClose: false,
              start: startPos,
            });

            stream .. @each { |chunk|
              startPos += Buffer.byteLength(chunk, encoding);
              buf += chunk;
              var chunks = buf.split(sep);
              if (chunks.length > 1) {
                var lines = chunks.slice(0, -1);
                // keep partial lines around for next read
                buf = chunks .. @at(-1);
                emit(lines);
              }
            }
            // reached the end of file. Wait for a change event
            // and then restart the loop to read more data
            change .. @wait();
          }
        }

      } finally {
        close();
      }
    }
  });
}

if (require.main === module) {
  @logging.setLevel(@logging.DEBUG);
  var path = @argv() .. @first;
  exports.follow(path, 'utf-8') .. @each {|lines|
    if (lines === null) {
      console.log(" -- truncated --");
    } else {
      lines .. @each {|line|
        console.log(" + " + line);
      }
    }
  }
  console.log("done");
}
