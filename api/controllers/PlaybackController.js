var Logger = require('../services/Logger');

module.exports = (function() {

  var PlaybackController = {},
      log = Logger('PlaybackController');

  function action(fn, req, res) {
    var device_id = req.body.device,
        attempt;

    if(!req.session.userid)
      return res.forbidden();

    if(!device_id)
      return res.badRequest('missing device id');

    function finish(error, info) {
      if(error)
        return res.badRequest(error);

      return res.status(202).json(info);
    }

    function lookupCb(err, permission) {
      if(err || !permission || !permission.user || !permission.device) {
        log("unable to find device or permission for device");
        return res.notFound('unable to find device');
      }

      log((fn.toUpperCase())+' device['+permission.device.name+']');
      return DeviceControlService.audio[fn](permission.device, finish);
    }

    attempt = Devicepermission.findOne({
      device: device_id, 
      user: req.session.userid
    });

    attempt.populate('device').populate('user').exec(lookupCb);
  }

  PlaybackController.restart = function(req, res, next) {
    return action('restart', req, res);
  };

  PlaybackController.start = function(req, res, next) {
    return action('start', req, res);
  };

  PlaybackController.stop = function(req, res, next) {
    return action('stop', req, res);
  };

  PlaybackController.skip = function(req, res, next) {
    return action('skip', req, res);
  };

  return PlaybackController;

})();

