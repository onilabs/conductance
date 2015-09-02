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
        ArrayKey: ['ArrayVal1', 'ArrayVal2', 'aardvarkArrayVal'],
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

      u.addSection('Service', {
        Environment: [
          'arrayOfString=value 1',
        ],
      });

      var file = new @stream.WritableStringStream();
      u._write(file);
      file.data .. normalizeFile .. @assert.eq('
      [Unit]
      ArrayKey=ArrayVal1
      ArrayKey=ArrayVal2
      ArrayKey=aardvarkArrayVal
      ExecArray=bash -c \'echo "1"\'
      ExecString=bash -c "echo 1"
      StringKey=StringVal

      [Service]
      Environment=string1=1 string2=2
      Environment=array1=\'val1 string2=2\'
      Environment=array2=\'\"val2\"\'
      Environment=object1=\'val1 object2=2\'
      Environment=object2=2
      Environment=arrayOfString=value 1
      ' .. normalizeFile);
    }
  }

  @context("unit objects") {||
    @test("lowercases target") {||
      @sd.Unit('TYP').type .. @assert.eq('typ');
    }

    @test("titlecases default section") {||
      @sd.Unit('foo', {}).sections .. @ownKeys() .. @toArray() .. @assert.eq(['Foo']);
      @sd.Unit('fooBar', {}).sections .. @ownKeys() .. @toArray() .. @assert.eq(['FooBar']);
    }

    @test("warns on suspicious section names") {||
      var messages = [];
      @logging.logContext({
        level: @logging.WARN,
        formatter: (log) -> [log.level].concat(log.args),
        console: { log: messages.push.bind(messages) },
      }) { ||
        var sections = @sd.Unit('unit', null, {'foo': {}}).sections .. @ownKeys() .. @toArray();
        sections .. @assert.eq(['foo']);
      }
      messages .. @assert.eq(["WARN", "Unknown systemd unit section 'foo' - did you mean 'Foo'?"]);
    }
  }

  @context("group") {||

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
        ],
        'service': [
          @sd.Service(),
        ],
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
          'Service': {
            ExecStart: @sd.ConductanceArgs.concat("serve", @env.configPath()),
            SyslogIdentifier: 'myapp-server',
          },
        },
        socket: baseSettings,
        timer: baseSettings,
        unknowntype: baseSettings,
      });

      // standalone service is linked directly to the group target
      var standaloneService = group .. componentSettings('service') .. @get('service');
      @logging.info(standaloneService);
      standaloneService.Unit.PartOf .. @assert.eq('myapp.target');
      standaloneService.Install .. @assert.eq({
        WantedBy: 'myapp.target',
      });
    }

    @test("maintains ordering of array values") {||
      var u = new @sd._UnitFile('/ignored', 'test.service');
      u.addSection('Unit', {
        ArrayKey: ['3', '2', '1']
      });

      var file = new @stream.WritableStringStream();
      u._write(file);
      file.data .. normalizeFile .. @assert.eq('
      [Unit]
      ArrayKey=3
      ArrayKey=2
      ArrayKey=1
      ' .. normalizeFile)
    }

    @test("socket accepts a Listen key which can contain conductance ports") {||
      var settings = @sd.Group({'server': @sd.Socket({
        Listen: [@Port(2020), @Port(1234, 'localhost')],
      })}) .. componentSettings('server');

      settings .. @getPath('socket.Socket.Listen', null) .. @assert.eq(null);
      settings .. @getPath('socket.Socket.ListenStream') .. @assert.eq(['2020', 'localhost:1234']);
    }

    @test("accepts a single unit per component") {||
      @sd.Group({'server': @sd.Service()});
    }

    @context("error messages for invalid arguments") {||
      @test("non-object") {||
        @assert.raises({message: "object required (Group components)"}, -> @sd.Group('server'));
      }
      @test("old-style plain object") {||
        @assert.raises({message: "Not a systemd.Unit object: { Service: {} }"}, -> @sd.Group({main: {Service: {}}}));
      }
      @test("duplicate unit types") {||
        @assert.raises({message: "myapp-server component contains duplicate unit types"}, -> @sd.Group('myapp', {'server': [ @sd.Service(), @sd.Service() ]}));
      }
    }
  }

}.skipIf(@isBrowser || @isWindows);
