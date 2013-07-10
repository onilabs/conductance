var {context, test, assert} = require('sjs:test/suite');
var {each, map} = require('sjs:sequence');
var url = require('sjs:url');
var fs = require('sjs:nodejs/fs');
var childProcess = require('sjs:nodejs/child-process');
var cutil = require('sjs:cutil');

var hosts = require('./hosts');

var proxy = null;
test.afterAll {||
	console.log("EL PROXY STOP");
	if(proxy) {
		proxy.resume();
	}
};

[
	{
		platform: 'linux',
		arch: 'x64',
		archive: 'linux_x64.tar.gz',
	},
	{
		platform: 'osx',
		arch: 'x64',
		archive: 'linux_x64.tar.gz',
	},
	{
		platform: 'windows',
		arch: 'x64',
		archive: 'linux_x64.tar.gz',
	},
] .. each {|system|
	var platform = system.platform;
	var arch = system.arch;
	context("#{platform}_#{arch}") {||
		var host = hosts[platform];
		var bundle = url.normalize("../dist/#{system.archive}", module.id) .. url.toPath();
		test.beforeAll {||
			childProcess.run('redo-ifchange', [bundle], {'stdio':'inherit'});
			if (!proxy) {
				proxy = cutil.breaking {|brk|
					require('../proxy-server').serve(9090, brk);
				}
			}
		}

		test('host is available') {||
			host.runCmd('true');
		}

		context('manual') {||
			test('unpack & boot') {||
				assert.ok(fs.exists(bundle));
				host.copyFile(bundle, '/tmp/conductance-install');
				host.runCmd('bash -ex -c "cd $HOME; rm -rf .conductance; mkdir .conductance; cd .conductance; tar zxf /tmp/conductance-install"');
				host.runCmd('export CONDUCTANCE_DEBUG=1 HTTP_PROXY=' + host.proxy +'; $HOME/.conductance/boot.sh');
				host.runCmd('$HOME/.conductance/bin/conductance --help');
			}
		}
	}.timeout(null);
}
