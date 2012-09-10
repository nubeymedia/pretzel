module.exports = function(app) {
  var default_methods = "get";
  var __appdir = __dirname + "/..";
  var __dir = {
    controllers: __appdir + '/app/controllers',
    models:      __appdir + '/app/models',
    views:       __appdir + '/app/views',
    helpers:     __appdir + '/app/helpers',
    config:      __appdir + '/config',
    libraries:   __appdir + '/lib'
  }
  
  function controllerAction(controller,action,routeInfo) {
    return function(req, res, n) {
      var beforeFilter = controllers[controller]['beforeFilter'];
      var render = res.render;
      var error = res.error;
      var path = controller + '/' + action;

      res.render = function(obj,options,fn) {
        res.render = render;
        options = options || {};
        for (var attr in obj) if (obj.hasOwnProperty(attr)) options[attr] = obj[attr];
        return res.render(path, options, fn);
      }

      next = function() {
        res.render = render;
        n.apply(this, arguments);
      }
      
      fn = controllers[controller][action];
      if (beforeFilter) beforeFilter.apply(this, [action].concat([].slice.call(arguments)));
      fn.apply(this, [req, res, next]);
    }
  }

  function bootLibraries() {
    var matched;
    require('fs').readdirSync(__dir.libraries).forEach(function(fileName) {
      if (matched = fileName.match(/^([\w_]+).js$/)) {
        var libraryName = matched[1];
        var library = require(__dir.libraries + "/" + fileName);
        pretzel[libraryName] = library;
        library.initialize(app);
      }
    });
  }

  function bootControllers() {
    var matched;
    require('fs').readdirSync(__dir.controllers).forEach(function(fileName) {
      if (matched = fileName.match(/(\w+)_controller.js$/)) {
        var c = controllers[matched[1]] = {};
        var actions = require(__dir.controllers + '/' + fileName);
        Object.keys(actions).map(function(actionName) {
          c[actionName] = actions[actionName];
        });
      }
    });
  }

  function bootRoutes() {
    var matched;
    Object.keys(routes).map(function(r) {
      if (matched = routes[r].controller.match(/(\w+)#(\w+)/)) {
        var methods = (routes[r].methods || default_methods).split("/");
        methods.forEach(function(m) {
          var hook = app[m];
          hook.call(app,routes[r].matches, controllerAction(matched[1],matched[2],routes[r]));
        });
      }
    });
  }

  var matched;
  var controllers = {};
  var routes = require(__dir.config + '/routes.js');

  (function() {
    gx = global.pretzel = {}
    gx.env = app.settings.env;
    gx.__dir = __dir;
    app.set("views", __dir.views);
    bootLibraries();
    bootControllers();
    bootRoutes();
  })();
}
