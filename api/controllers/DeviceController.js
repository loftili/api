var net = require('net');

module.exports = {

  update: function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10),
        device_id = parseInt(req.params.id, 10);

    function finish(err, device) {
      if(err) {
        sails.log('[DeviceController][update] failed saving after update err['+err+']');
        return res.status(422).json(err);
      }

      return res.status(200).json(device[0]);
    }

    function foundDevice(err, device) {
      if(err) {
        sails.log('[DeviceController][update] failed getting device for updating');
        return res.status(404).send('');
      }

      sails.log('[DeviceController][update] found device, checking permissions');
      var allowed = false,
          LEVELS = DeviceShareService.LEVELS;

      for(var i = 0; i < device.permissions.length; i++) {
        var current = device.permissions[i],
            is_current = current.user === user_id,
            is_owner = current.level == LEVELS.DEVICE_OWNER;

        if(is_current && is_owner)
          allowed = true;
      }

      if(!allowed) {
        sails.log('[DeviceController][update] current user not allowed to update the device, fail out');
        return res.status(401).send('');
      }

      Device.update({id: device_id}, {ip_addr: req.body.ip_addr}).exec(finish);
    }

    sails.log('[DeviceController][update] attempting to get device info for device['+device_id+']');
    Device.findOne({id: device_id}).populate('permissions').exec(foundDevice);
  },

  destroy: function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function destroyed(err, device) {
      return res.status(200).send('');
    }

    function finish(err, device) {
      if(err) {
        sails.log('[DeviceController][destroy] errored finding device: ' + err);
        return res.status(404).send('');
      }

      if(!device) {
        sails.log('[DeviceController][destroy] unable to find device for destroy');
        return res.status(404).send('');
      }

      sails.log('[DeviceController][destroy] found device');

      var can_destroy = false,
          permissions = device.permissions,
          levels = DeviceShareService.LEVELS;

      for(var i = 0; i < permissions.length; i++) {
        var permission = permissions[i],
            is_owner =  permission.level === levels.DEVICE_OWNER,
            is_current_user = permission.user === user_id;

        if(!is_current_user)
          continue;

        if(is_owner)
          can_destroy = true;
        else
          can_destroy = false;

        break;
      }

      if(can_destroy) 
        device.destroy(destroyed);
      else
        return res.status(404).send('');
    }

    if(device_id >= 0)
      Device.findOne(device_id).populate('permissions').exec(finish);
    else
      return res.status(404).send('');
  },
    

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
        return res.status(408).json(found_device);
      }

      sails.log("[DeviceController][finishing] - devicecontrollerservice ping success");

      var device_json = found_device.toJSON();

      try {
        device_json.ping = JSON.parse(body);
      } catch(e) {
        device_json.ping = {
          "status": "error",
          "message": "could not parse response from device"
        };
      }

      return res.status(200).json(device_json);
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

