var PORT = 9876;
var serverPort = require('./server.js').port;

var exports = module.exports = function(config) {
  var plugins = [
    'karma-chrome-launcher'
    ,'karma-firefox-launcher'
    ,'karma-script-launcher'
    ,'karma-phantomjs-launcher'
    ,'karma-sjs-adapter'
  ];
  var browsers = [
    // XXX phantomJS is struggling with CORS & redirects
    // 'PhantomJS',
    'Chrome',
  ];

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

    proxies: { '/app/': 'http://localhost:' + serverPort + '/' },

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

exports.port = PORT;
exports.testScript = '/app/test/main.sjs';

