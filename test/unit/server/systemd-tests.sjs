@ = require(['sjs:test/std', 'mho:std']);

@context {|| // serverOnly
  var normalizeFile = str -> str
    .replace(/^ +/gm, '')
    .replace(/^X-Conductance.*/gm, '')
    .replace(/\n+/g, '\n').trim();

  var componentSettings = function(group, name) {
    return group.components .. @get(name) .. @map(function(unit) {
      var sections = unit.sections;
      if (sections.Unit) {
        sections.Unit = sections.Unit
          .. @ownPropertyPairs
          .. @filter([k,v] -> !k .. @startsWith('X-'))
          .. @pairsToObject();
      }
      if (sections.Unit .. @eq({})) delete sections.Unit;
      return [unit.type, sections];
    }) .. @pairsToObject;
  }

  @sd = require('mho:server/systemd');
  @stream = require('sjs:nodejs/stream');

  @context("unit file generation") {||
    @test("generates valid unit file") {||
      var u = new @sd._UnitFile('/ignored', 'test.service');
      u.addSection('Unit', {
        StringKey: 'StringVal',
        ArrayKey: ['ArrayVal1', 'ArrayVal2'],
        ExecString: 'bash -c "echo 1"',
        ExecArray: ['bash', '-c', 'echo "1"'],
      });

      u.addSection('Service', {
        Environment: 'string1=1 string2=2',
      });

      u.addSection('Service', {
        Environment: [
          ['array1', 'val1 string2=2'],
          ['array2', '"val2"'],
        ],
      });

      u.addSection('Service', {
        Environment: {
          'object1': 'val1 object2=2',
          'object2': '2',
        },
      });

      var file = new @stream.WritableStringStream();
      u._write(file);
      file.data .. normalizeFile .. @assert.eq('
      [Unit]
      ArrayKey=ArrayVal1
      ArrayKey=ArrayVal2
      ExecArray=bash -c \'echo "1"\'
      ExecString=bash -c "echo 1"
      StringKey=StringVal

      [Service]
      Environment=\'array1=val1 string2=2\'
      Environment=\'array2=\"val2\"\'
      Environment=\'object1=val1 object2=2\'
      Environment=object2=2
      Environment=string1=1 string2=2
      ' .. normalizeFile);
    }
  }

  @context("unit objects") {||
    @test("lowercases target") {||
      @sd.Unit('TYP').type .. @assert.eq('typ');
    }

    @test("titlecases default section") {||
      @sd.Unit('foo', {}).sections .. @ownKeys() .. @toArray() .. @assert.eq(['Foo']);
      @sd.Unit('fooBar', {}).sections .. @ownKeys() .. @toArray() .. @assert.eq(['Foobar']);
    }

    @test("warns on suspicious section names") {||
      var messages = [];
      using (@logging.logContext({
        level: @logging.WARN,
        formatter: (log) -> [log.level].concat(log.args),
        console: { log: messages.push.bind(messages) },
      })) {
        var sections = @sd.Unit('unit', null, {'FOO': {}}).sections .. @ownKeys() .. @toArray();
        sections .. @assert.eq(['FOO']);
      }
      messages .. @assert.eq(["WARN", "Unknown systemd unit section 'FOO' - did you mean 'Foo'?"]);
    }

    @test("adds mandatory properties to all units") {||
      var mandatoryProperties = {
        'X-Conductance-Generated': 'true',
        'X-Conductance-Format': String(@sd._format),
        'X-Conductance-Group': 'myapp',
      };

      var group = @sd.Group('myapp', {
        'server': [
          @sd.Service(),
          @sd.Socket(),
          @sd.Timer(),
          @sd.Unit('unknowntype'),
        ]
      });

      var units = group.components.server;
      units.length .. @assert.eq(4);
      units .. @each {|unit|
        unit.sections.Unit
          .. @ownPropertyPairs
          .. @tap(f -> f .. @toArray .. @info)
          .. @filter([k,] -> k .. @tap(@warn) .. @startsWith('X-'))
          .. @pairsToObject
          .. @assert.eq(mandatoryProperties)
      }
    }

    @test("adds default properties") {||
      var group = @sd.Group('myapp', {
        'server': [
          @sd.Service(),
          @sd.Socket(),
          @sd.Timer(),
          @sd.Unit('unknowntype'),
        ]
      });
      var baseSettings = {
        'Unit': {
          PartOf: 'myapp.target',
        },
        'Install': {
          WantedBy: 'myapp.target',
        }
      };

      group .. componentSettings('server') .. @assert.eq({
        service: {
          'Unit': {
            After: ['local-fs.target', 'network.target'],
            Requires: ['myapp-server.socket'],
          },
          'Install': {
            WantedBy: 'myapp.target',
          },
          'Service': {
            ExecStart: @sd.ConductanceArgs.concat("run", @env.configPath()),
          },
        },
        socket: baseSettings,
        timer: baseSettings,
        unknowntype: baseSettings,
      });
    }

    @test("service is linked directly to target if no trigger units are given") {||
      @sd.Group('myapp', {
        'server': [ @sd.Service() ]
      }) .. componentSettings('server') .. @getPath('service.Unit') .. @get('PartOf', null) .. @assert.eq(null);
    };

    @test("socket accepts a Listen key which can contain conductance ports") {||
      var settings = @sd.Group({'server': @sd.Socket({
        Listen: [@Port(2020), @Port(1234, 'localhost')],
      })}) .. componentSettings('server');

      settings .. @getPath('socket.Socket.Listen', null) .. @assert.eq(null);
      settings .. @getPath('socket.Socket.ListenStream') .. @assert.eq(['2020', 'localhost:1234']);
    }
  }

}.skipIf(@isBrowser || @isWindows);
