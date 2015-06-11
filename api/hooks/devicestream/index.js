var Logger = require('../../services/Logger');

module.exports = function(sails) {

  var Hook = {},
      log = Logger('[Hook] DeviceStream');

  function subscribe(req, res, next) {
    if(!/subscribe/i.test(req.method)) return next();
    log('device subscription attempt received, passing to DeviceStreamController');
    return sails.controllers.devicesocket.open(req, res);
  }

  function addSockets() {
    sails.hooks.http.app.all('/sockets/devices', subscribe);
  }

  Hook.initialize = function(cb) {
    sails.on('router:after', addSockets);
    cb();
  };

  return Hook;

};
