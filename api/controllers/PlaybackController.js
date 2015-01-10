module.exports = (function() {

  function action(fn, req, res) {
    var device_id = req.body.device,
        attempt;

    if(!req.session.userid)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('missing device id');

    sails.log('[PlaybackController.' + fn + '] ' + fn + ' playback on ' + device_id);

    function finish(error, d_response, d_body) {
      if(error)
        return res.status(408).send(error);

      sails.log('[PlaybackController.finish] Successfully executed ' + fn + ' on  ' + device_id + ' STATUS[' + d_response.statusCode + ']');
      return res.status(202).json({response: JSON.parse(d_body)});
    }

    function lookupCb(err, permission) {
      if(err || !permission || !permission.user || !permission.device)
        return res.status(404).send('unable to find device');

      if(fn === 'start')
        sails.log('[PlaybackController.start] Found device, playing ' + permission.device.name);
      else
        sails.log('[PlaybackController.stop] Found device, stopping ' + permission.device.name);

      DeviceControlService[fn](permission.user, permission.device, finish);
    }

    attempt = Devicepermission.findOne({device: device_id, user: req.session.userid});
    attempt.populate('device').populate('user').exec(lookupCb);
  }

  return {

    restart: function (req, res) {
      action('restart', req, res);
    },

    start: function (req, res) {
      action('start', req, res);
    },

    stop: function (req, res) {
      action('stop', req, res);
    }

  }

})();

