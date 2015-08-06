#!/usr/bin/env sjs
@ = require('sjs:std');
@dd = require('sjs:dashdash');
@stream = require('sjs:nodejs/stream');

var QUIET_TIME = 3000; // 3s
var MAX_LINES = 20;

var logOwner = function(log) {
  return log['_SYSTEMD_UNIT'] || log['UNIT'] || log['SYSLOG_IDENTIFIER'] || '<unknown-service>';
};

var unitFailed = function(unit) {
  try {
    @childProcess.run('systemctl', ['is-failed', '--quiet', unit], {'stdio':['ignore', 'ignore', process.stderr]});
    return true;
  } catch (e) {
    return false;
  }
};

var lines = function(stream) {
  var buf = '';
  var chunk, lines=[];
  return @Stream(function(emit) {
    stream .. @stream.contents('utf-8') .. @each {|chunk|
      lines = (buf + chunk).split('\n');
      buf = lines.pop(); // unfinished line
      while(lines.length > 0) {
        emit(lines.shift());
      }
    }
    if(buf) emit(buf);
  });
};

var accumulate = function(stream, time, max_lines) {
  return @Stream(function(emit) {
    var END = {};
    var q = @Queue(10);
    waitfor {
      // populate queue
      stream .. @each {|line|
        q.put(line);
      }
      q.put(END);
    } and {
      // read queue, emitting batches of lines
      var line;
      while(true) {
        // wait until there's something
        q.peek();
        var lines = [];
        while(true) {
          waitfor {
            line = q.get();
            if (line === END) break;
            lines.push(line);
            if (lines.length >= max_lines) break;
          } or {
            hold(time);
            break;
          }
        }

        if (lines.length > 0) {
          emit(lines);
        }
        if (line === END) break;
      }
    }
  });
};

var parseJson = function(str) {
  // error-reporting wrapper for JSON.parse
  try {
    return JSON.parse(str);
  } catch(e) {
    @error("Can't parse JSON:", JSON.stringify(str));
    throw e;
  }
};

exports._main = function() {

  var parser = @dd.createParser({ options: [
    {
      names: ['unit', 'u'],
      type: 'arrayOfString',
      'default': [],
    },
    {
      names: ['help', 'h'],
      type: 'bool',
    },
    {
      name: 'cursor-file',
      type: 'string',
    },
    {
      name: 'unit-log',
      type: 'arrayOfString',
      'default': [],
    },
    {
      name: 'heartbeat-interval',
      type: 'number',
      help: 'heartbeat time (minutes)',
      'default': 30,
    },
    {
      name: 'check-interval',
      type: 'number',
      help: 'service check interval (minutes)',
      'default': 5,
    },
    {
      name: 'debug',
      type: 'bool',
    },
  ]});

  var opts = parser.parse();
  if (opts.help) {
    console.warn("Usage: service-monitor.sjs [OPTIONS]\n\nOptions:\n#{parser.help()}");
    process.exit(0);
  }

  var backend;
  if (opts.debug) {
    backend = 'log';
    @logging.setLevel(@logging.DEBUG);
  } else {
    @logging.setLevel(@logging.INFO);
  }
  @datadog = require('./datadog').Datadog();
  @debug('OPTS:', opts);

  @assert.ok(opts.unit.length > 0, 'you must provide at least one unit');
  @assert.ok(opts.cursor_file, '--cursor-file');

  // dedupe --unit and --unit-log options
  ;['unit', 'unit_log'] .. @each {|key|
    opts[key] = opts[key] .. @unique .. @toArray;
  };

  var cursor = undefined;
  try {
    cursor = @fs.readFile(opts.cursor_file, 'utf-8').trim();
  } catch(e) {
    if (e.code != 'ENOENT') throw e;
  }
  var initialCursor = cursor;

  var saveCursor = @fn.sequential(function() {
    if (initialCursor === undefined || cursor !== initialCursor) {
      @debug("saving cursor (#{cursor}) to #{opts.cursor_file}");
      @fs.writeFile(opts.cursor_file, cursor || '', 'utf-8');
    }
    initialCursor = cursor || null;
  });

  try {
    var unitArgs = opts.unit_log .. @map(unit -> ['-u', unit]) .. @concat .. @toArray;
    var args = ['-f', '--output=json'].concat(unitArgs);
    if (cursor) {
      args = args.concat('--cursor', cursor);
    } else {
      args.push('--lines=1');
    }

    @info("Running journalctl #{args.join(" ")}");
    var proc = @childProcess.launch('journalctl', args, {stdio: ['ignore', 'pipe', process.stderr]});

    var errorLines = 0;

    waitfor {
      @childProcess.wait(proc);
      throw new Error('journalctl exited');
    } or {
      // state lines like "-- REBOOT --" can appear in journal output, and are distinctly un-JSON
      var isLogLine = (line) -> line .. @startsWith("{");
      proc.stdout .. lines .. @skip(1) .. @filter(isLogLine) .. accumulate(QUIET_TIME, MAX_LINES) .. @each {|lines|
        lines = lines .. @map(parseJson);
        cursor = (lines .. @at(-1))['__CURSOR'];
        @assert.ok(cursor, '__CURSOR');
        lines .. @groupBy(logOwner) .. @each {|[name, lines]|
          lines = lines .. @map(log -> log .. @get('MESSAGE', '(no message)'));
          @info("sending #{name} output event");
          errorLines += lines .. @filter(line -> /error/i.test(line)) .. @count;
          @datadog.event({
            title: "#{name} log output",
            tags: ['log:output', "unit:#{name}"],
            alertType: 'info',
            text: lines .. @join("\n"),
          });
        }
      }
      @error("reached journal stream EOF");
    } or {
      if (opts.heartbeat_interval > 0) {
        while(true) {
          hold(opts.heartbeat_interval * (60*1000));

          var errorMetric = errorLines;
          errorLines = 0;
          @info("sending heartbeat, errorlines=#{errorMetric}");
          @datadog.metric('user.monitor.alive', { tags: opts.unit }, [1]);
          @datadog.metric('user.monitor.errorlines', { tags: opts.unit }, [errorMetric]);
        }
      } else {
        @info("heartbeat disabled");
        hold();
      }
    } or {
      while(true) {
        hold(1 * 60 * 1000);
        saveCursor();
      }
    } or {
      if (opts.check_interval > 0) {
        var ok = true;
        while(true) {
          hold(opts.check_interval * (60 * 1000));
          var failedUnits = opts.unit .. @filter(u -> unitFailed(u)) .. @toArray;
          nowOk = failedUnits.length == 0;
          if (ok != nowOk) {
            ok = nowOk;
            if (ok) {
              // send the all-clear
              @datadog.event({
                title: "All services running",
                tags: ['unit:running', 'unit:status'],
                alertType: 'info',
                text: opts.unit.join(', '),
              });
            } else {
              // send failure event
              @datadog.event({
                title: "STOPPED: #{failedUnits.join(', ')}",
                tags: ['unit:stopped', 'unit:status'],
                alertType: 'error',
                text: "No further status events will be sent until service is restored",
              });
            }
          }
          @datadog.metric('user.services.failed', {
              tags: ['unit:stopped', 'unit:status'],
            },
            [failedUnits.length]);
        }
      } else {
        @info("unit status check disabled");
        hold();
      }
    }
    throw new Error("monitor loop terminated");
  } finally {
    saveCursor();
  }
  throw new Error("script ended");
}

exports.main = function() {
  try {
    exports._main();
  } catch(e) {
    if (@datadog) {
      @datadog.event({
        title: 'monitor-logs crashed',
        tags: ['log:error'],
        alertType: 'error',
        text: e.message,
      });
    };
    throw e;
  }
};

if (require.main === module) {
  exports.main();
}
