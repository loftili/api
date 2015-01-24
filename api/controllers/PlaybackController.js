module.exports = (function() {

  var PlaybackController = {};

  function action(fn, req, res) {
    var device_id = req.body.device,
        attempt;

    if(!req.session.userid)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('missing device id');

    function finish(error, info) {
      if(error) {
        return res.status(404).send(error);
      }

      return res.status(202).json(info);
    }

    function lookupCb(err, permission) {
      if(err || !permission || !permission.user || !permission.device) {
        return res.status(404).send('unable to find device');
      }

      sails.log('[PlaybackController]['+fn+']['+new Date()+'] '+(fn.toUpperCase())+' device['+permission.device.name+']');
      return DeviceControlService[fn](permission.device, finish);
    }

    attempt = Devicepermission.findOne({device: device_id, user: req.session.userid});
    attempt.populate('device').populate('user').exec(lookupCb);

    return;
  }

  PlaybackController.restartPlayback = function(req, res, next) {
    return action('restart', req, res);
  };

  PlaybackController.startPlayback = function(req, res, next) {
    return action('start', req, res);
  };

  PlaybackController.stopPlayback = function(req, res, next) {
    return action('stop', req, res);
  };


  return PlaybackController;

})();

