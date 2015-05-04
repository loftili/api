var bcrypt = require('bcrypt');

module.exports = (function() { 
  
  var RegistrationController = {}; 

  function log(msg) {
    sails.log('serial number: ' + msg);
  }

  RegistrationController.register = function(req, res, next) {
    var body = req.body,
        serial = body ? body.serial_number : false;

    function updatedDevice(err, device) {
      if(err) return res.badRequest('invalid serial number [2]');
      return res.json({token: device.token});
    }

    function foundSerial(err, serial_record) {
      if(err) return res.badRequest('invalid serial number [1]');

      if(!serial_record || serial_record.devices.length !== 1)
        return res.badRequest('invalid serial number [3]');

      var device = serial_record.devices[0];
      
      /*
      if(device.token) {
        return res.badRequest('invalid serial number [0]');
      }
      */

      device.token = DeviceTokenService.generate(device.name);
      device.save(updatedDevice);
    }

    DeviceSerial.findOne({serial_number: serial}).populate('devices').exec(foundSerial);
  };

  return RegistrationController;

})();
