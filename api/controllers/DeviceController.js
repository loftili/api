var net = require('net');

module.exports = {

  ping: function(req, res, next) {
    var device_id = req.params.id,
        user_id = req.session.user,
        username = req.session.username,
        found_device = null,
        found_user = null,
        failed = false;

    if(!user_id)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('');

    function finish(err, response, body) {
      if(err) {
        sails.log("[DeviceController][finishing] - devicecontrollerservice failed ping");
        found_device.status = false;
        found_device.save();
        return res.status(404).json(found_device);
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

    function sendPing() {
      if(found_user === null || found_device == null || failed)
        return;

      sails.log("[DeviceController][sendPing] - Found user and device for request, sending ping");
      DeviceControlService.ping(found_user, found_device, finish);
    }

    function foundUser(err, user) {
      if(err)
        return missing();

      sails.log("[DeviceController][foundUser] - found user");
      found_user = user;
      sendPing();
    }

    function foundDevice(err, device) {
      if(err)
        return missing();

      sails.log("[DeviceController][foundDevice] - found device");
      found_device = device;
      sendPing();
    }

    Device.findOne({id: device_id}).populate('permissions').exec(foundDevice);
    User.findOne({id: user_id}).exec(foundUser);
  }

};

