var serverConfig = require('./server.js');
var PORT = 9876;
var has = function(moduleName) {
  try {
    require.resolve(moduleName);
    return true;
  } catch(e) {
    return false;
  }
};

var exports = module.exports = function(config) {
  var plugins = [
    'karma-chrome-launcher'
    ,'karma-firefox-launcher'
    ,'karma-script-launcher'
    ,'karma-phantomjs-launcher'
    ,'karma-sjs-adapter'
  ];
  var browsers = [
    'PhantomJS',
  ];

  var iePlugin = 'karma-ie-launcher';
  if (has(iePlugin)) {
    plugins.push(iePlugin);
    browsers = ['IE'];
  }

  config.set({
    basePath: '../',
    frameworks: [ 'sjs', ],
    files: [ ],

    client: {
      hubs: {
        'mho:' : '/app/__mho/',
      },
      // workaround for https://github.com/karma-runner/karma/issues/961
      captureConsole: true,
    },

    proxies: { '/app/': 'http://localhost:' + serverConfig.port + '/' },

    exclude: [],

    reporters: ['progress'],

    port: PORT,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: browsers,

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 0,

    singleRun: false,

    plugins: plugins,
  });
};

exports.testScript = '/app/test/run.html';
exports.port = PORT;

