var serverConfig = require('./server.js');
var exports = module.exports = function(config) {
  config.set({
    basePath: '../',
    frameworks: [ 'sjs', ],
    files: [ ],

    client: {
      hubs: {
        'app:' : '/app/',
        'mho:' : 'app:__mho/',
      },
    },

    proxies: { '/app/': 'http://localhost:' + serverConfig.port + '/' },

    exclude: [],

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: [
      'PhantomJS',
    ],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 0,

    singleRun: false,

    plugins: [
      'karma-chrome-launcher'
      ,'karma-firefox-launcher'
      ,'karma-script-launcher'
      ,'karma-phantomjs-launcher'
      ,'karma-sjs-adapter'
    ],
  });
};

exports.testScript = 'app:test/run.html';

