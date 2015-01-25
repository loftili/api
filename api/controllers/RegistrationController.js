var bcrypt = require('bcrypt');

module.exports = (function() {

  var RegistrationController = {};
	
  RegistrationController.register = function(req, res, next) {
    var devicename = req.body.devicename,
        username = req.body.username,
        password = req.body.password,
        remote_ip = req.connection.remoteAddress,
        DEFAULT_DEVICE_INFO = {
          'player:state': 0
        },
        port = req.body.port,
        found_user = null,
        created_device,
        device_token;

    function log(msg) {
      msg = ['[RegistrationController]['+new Date()+']', msg].join(' ');
      sails.log(msg);
    }

    function finished() {
      log('finished creating permission for new device');
      return res.status(200).json({"status": "ok", "token": device_token, "id": created_device.id});
    }

    function createdPermission(err, permission) {
      device_token = created_device.token;
      log('prepping initial device state information');
      DeviceStateService.update(created_device.id, DEFAULT_DEVICE_INFO, finished);
    }

    function createdDevice(err, device) {
      if(err) {
        sails.log(err);
        return res.status(400).send(err);
      }

      var params = {
        device: device.id,
        target: found_user.id,
        level: DeviceShareService.LEVELS.DEVICE_OWNER,
        force: true
      };

      created_device = device;
      log('creating permission for new device');

      DeviceShareService.share(params, createdPermission);
    }

    function createDevice() {
      var hostname = [devicename, username].join('.'),
          device_secret = process.env['DEVICE_SECRET'],
          token_unhashed = [device_secret, devicename].join(':'),
          params = {
            name: devicename,
            registered_name: hostname,
            ip_addr: remote_ip, 
            port: port,
            token: DeviceTokenService.generate(hostname)
          };

      log('user authenticated, creating: ' + devicename + '[' + remote_ip + ']');
      Device.findOrCreate({registered_name: hostname}, params, createdDevice);
    }

    function authCheck(err, hash) {
      return (err || !hash) ? res.status(401).send('unable to authenticate') : createDevice();
    }

    function foundUser(err, user) {
      if(err || !user) {
        log('errored looking up user: ' + username);
        return res.status(401).send('unable to authenticate');
      }

      found_user = user;
      sails.log('[RegistrationController.register] found user, registering a new device: ' + devicename);
      bcrypt.compare(password, user.password, authCheck);
    }

    if(devicename && username && password && port) {
      log('looking up user: ' + username);
      User.findOne({username: username}).exec(foundUser);
    } else {
      return res.status(400).send('missing registration parameters');
    }

  };

  return RegistrationController;

})();
