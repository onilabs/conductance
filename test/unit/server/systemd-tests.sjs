@ = require('sjs:test/std');

@context {|| // serverOnly
  var normalizeFile = str -> str
    .replace(/^ +/gm, '')
    .replace(/^X-Conductance.*/gm, '')
    .replace(/\n+/g, '\n').trim();

  @sd = require('mho:server/systemd');
  @stream = require('sjs:nodejs/stream');

  @context("unit generation") {||
    @test("generates valid systemd file") {||
      var u = new @sd._Unit('/ignored', 'test.service');
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

}.skipIf(@isBrowser || @isWindows);
