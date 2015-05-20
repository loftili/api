module.exports = function(sails) {

  var Hook = {};

  function subscribe(req, res, next) {
    if(!/subscribe/i.test(req.method)) return next();
    return sails.controllers.devicestream.open(req, res);
  }

  function addSockets() {
    sails.hooks.http.app.all('/devicestream', subscribe);
  }

  Hook.initialize = function(cb) {
    sails.on('router:after', addSockets);
    cb();
  };

  return Hook;

};
