var net = require('net');

module.exports = {

  findOne: function(req, res, next) {
    var device_id = parseInt(req.params.id, 10);

    function finish(err, device) {
      if(err) {
        sails.log('[DeviceController][findOne] errored finding device: ' + err);
        return rest.status(404).send('');
      }

      return device ? res.json(device) : res.status(404).send('');
    }

    if(device_id >= 0)
      Device.findOne(device_id).exec(finish);
    else
      return res.status(404).send('');
  },

  ping: function(req, res, next) {
    var device_id = req.params.id,
        user_id = req.session.userid,
        username = req.session.username,
        failed = false,
        found_device = null,
        attempt;

    if(!user_id)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('');

    function finish(err, response, body) {
      if(err) {
        sails.log("[DeviceController][finishing] - devicecontrollerservice failed ping");
        found_device.status = false;
        found_device.save();
        return res.status(408).json(found_device);
      }

      found_device.status = true;
      found_device.save();
      sails.log("[DeviceController][finishing] - devicecontrollerservice ping success");
      return res.status(200).json(found_device);
    }

    function missing() {
      if(failed) 
        return false;

      failed = true;
      return res.status(404).send('');
    }

    function lookupCb(err, permission) {
      if(err || !permission || !permission.user || !permission.device)
        return res.status(404).send('unable to find device');

      sails.log("[DeviceController][foundDevice] - found device");
      found_device = permission.device;
      DeviceControlService.ping(permission.user, permission.device, finish);
    }

    attempt = Devicepermission.findOne({device: device_id, user: req.session.userid});
    attempt.populate('device').populate('user').exec(lookupCb);
  },

  missing: function(req, res) {
    res.status(404).send('not found');
  }

};

