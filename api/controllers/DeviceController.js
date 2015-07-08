var net = require('net'),
    Logger = require('../services/Logger');

module.exports = (function() {

  var DeviceController = {},
      _log = Logger('DeviceController');

  DeviceController.find = function(req, res) { 
    var current_user = parseInt(req.session.userid, 10);
    
    if(!(current_user > 0)) return res.forbidden();

    function error(err) {
      _log(err);
      res.badRequest('');
    }

    function found(err, devices) {
      if(err) return error(err);
      var valid = [], i = 0, l = devices.length;

      for(i; i < l; i++) {
        var has_permission = devices[i].permissions.length > 0;
        if(has_permission) valid.push(devices[i]);
      }

      return res.json(valid);
    }

    _log('looking for devies for user: ' + current_user);
    Device.find().populate('permissions', {user: current_user}).exec(found);
  };

  DeviceController.create = function(req, res, next) {
    var body = req.body,
        serial = body ? body.serial_number : false,
        name =  body ? body.name : false,
        user_id = parseInt(req.session.userid, 10),
        created_device, found_serial;

    if(!(user_id > 0)) 
      return res.forbidden();

    if(!serial || !name) 
      return res.badRequest('missing device name or serial');

    function finish(err) {
      if(err) return res.badRequest(err);

      return res.json(created_device);
    }

    function created(err, device) {
      if(err) return res.badRequest(err);

      created_device = device;

      DevicePermissionManager.grant({
        device: device.id,
        target: user_id,
        level: DevicePermissionManager.LEVELS.DEVICE_OWNER,
        force: true
      }, finish);
    }

    function duplicateCheck(err, devices) {
      if(err) return res.badRequest(err);

      if(devices.length > 0) {
        _log('duplicated device, uh oh');
        return res.badRequest('invalid serial');
      }

      Device.create({
        serial_number: found_serial.id,
        name: name,
        registered_name: name
      }, created);
    }

    function foundSerial(err, serial_record) {
      if(err) return res.badRequest(err);

      if(!serial_record) {
        _log('attempt made to create device with bad serial');
        return res.badRequest('invalid serial');
      }

      found_serial = serial_record;
      Device.find({serial_number: serial_record.id}, duplicateCheck);
    }

    DeviceSerial.findOne({serial_number: serial}, foundSerial);
  };

  DeviceController.update = function(req, res, next) {
    var user_id = parseInt(req.session.userid, 10),
        device_id = parseInt(req.params.id, 10);

    function finish(err, device) {
      if(err) {
        _log('failed saving after update err['+err+']');
        return res.status(422).json(err);
      }

      return res.status(200).json(device[0]);
    }

    function foundDevice(err, device) {
      if(err) {
        _log('failed getting device for updating');
        return res.notFound();
      }

      if(!device) {
        _log('unable to find device for update');
        return res.notFound();
      }

      _log('found device, checking permissions');

      var allowed = false,
          LEVELS = DevicePermissionManager.LEVELS;

      for(var i = 0; i < device.permissions.length; i++) {
        var current = device.permissions[i],
            is_current = current.user === user_id,
            is_owner = current.level == LEVELS.DEVICE_OWNER;

        if(is_current && is_owner)
          allowed = true;
      }

      if(!allowed) {
        _log('current user not allowed to update the device, fail out');
        return res.notFound();
      }

      var updates = {},
          body = req.body || {},
          dnd = parseInt(body.do_not_disturb, 10);

      if(body.name)
        updates.name = body.name;

      if(dnd === 0 || dnd === 1)
        updates.do_not_disturb = dnd;

      Device.update({id: device_id}, updates).exec(finish);
    }

    _log('attempting to get device info for device['+device_id+']');
    Device.findOne({id: device_id}).populate('permissions').exec(foundDevice);
  };

  DeviceController.destroy = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function destroyed(err, device) {
      return res.status(200).send('');
    }

    function finish(err, device) {
      if(err) {
        _log('errored finding device: ' + err);
        return res.status(404).send('');
      }

      if(!device) {
        _log('unable to find device for destroy');
        return res.status(404).send('');
      }

      _log('found device');

      var can_destroy = false,
          permissions = device.permissions,
          levels = DevicePermissionManager.LEVELS;

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
  };

  DeviceController.findOne = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10);

    function finish(err, device) {
      if(err) {
        _log('errored finding device: ' + err);
        return rest.status(404).send('');
      }

      return device ? res.json(device) : res.status(404).send('');
    }

    if(!(device_id >= 0)) return res.badRequest('invalid device id');

    Device.findOne(device_id)
      .populate('permissions')
      .exec(finish);
  };

  return DeviceController;

})();

