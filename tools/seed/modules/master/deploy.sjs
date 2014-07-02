@ = require('mho:std');
@app = require('../job/app');
var { @mkdirp } = require('sjs:nodejs/mkdirp');
var { @rimraf } = require('sjs:nodejs/rimraf');
var { @User } = require('../auth/user');

var AppCollection = function(user) {
  var basePath = @app.getUserAppRoot(user);
  var val = @ObservableVar([]);
  var rv = {
    items: val .. @transform(function(ids) {
      return ids .. @map(function(id) {
        @info("Fetching app #{id}");
        return @app.masterAppState(user, id);
      });
    }),
    reload: function() {
      val.modify(function(current, unchanged) {
        var newval = @fs.readdir(basePath) .. @sort();
        if (newval .. @eq(current)) return unchanged;
        return newval;
      });
    },
  };
  rv.reload();
  return rv;
};

function createApp(appCollection, user, id, props) {
  if (@app.getAppPath(user, id) .. @fs.exists()) {
    throw new Error("App #{id} already exists");
  }
  var app = @app.masterAppState(user, id);
  app.config.modify(-> props);
  appCollection.reload();
  return app;
};

function destroyApp(appCollection, user, id) {
  @app.masterAppState(user, id).synchronize {||
    @info("Destroying app #{id}");
    @rimraf(@app.getAppPath(user, id));
    appCollection.reload();
  }
}

exports.Api = function(user) {
  @assert.ok(user instanceof @User);
  @mkdirp(@app.getUserAppRoot(user));
  var appCollection = AppCollection(user);

  return {
    user: user.id,
    apps: appCollection.items,
    getApp: id -> @app.masterAppState(user, id),
    createApp: (id, props) -> appCollection .. createApp(user, id, props),
    destroyApp: id -> appCollection .. destroyApp(user, id),
  };
};
