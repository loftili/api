var Logger = require('../services/Logger'),
    DeviceAuthentication = require('../services/DeviceAuthentication');

module.exports = (function() {

  var DeviceStateController = {},
      log = Logger('DeviceStateController');

  DeviceStateController.findOne = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function foundState(err, device_state) {
      if(err) {
        log(err);
        return res.badRequest(err);
      }

      return res.status(200).send(device_state);
    }

    function foundDevice(err, device) {
      if(err) {
        log(err);
        return res.badRequest();
      }

      if(!device) {
        log('unable to find device');
        return res.notFound();
      }

      var permissions = device.permissions,
          p_count = permissions.length,
          can_check = false;

      for(var i = 0; i < p_count; i++) {
        var p = permissions[i];
        if(p.user == user_id) {
          can_check = true;
        }
      }

      if(can_check)
        return DeviceStateService.find(device_id, foundState);

      log('user has no right');
      return res.notFound();
    }

    Device.findOne(device_id).populate('permissions').exec(foundDevice);
  };

  DeviceStateController.stream = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        stream_id = parseInt(req.body.stream, 10),
        current_user = parseInt(req.session.userid, 10),
        found_stream = null;

    if(isNaN(stream_id) || stream_id < 0) return res.badRequest('invalid stream id');

    function executed(err) {
      if(err) {
        log('unable to execute device command based on stream update: '+err);
        return res.serverError();
      }

      return stream_id === 0 ? res.status(204).send('') : res.json(found_stream);
    }

    function finish(err) {
      if(err) {
        log('unable to update device\'s stream state: ' + err);
        return res.serverError(err);
      }

      // finish by telling the device to update
      return stream_id === 0 ? DeviceControlService.audio.stop(device_id, executed) 
        : DeviceControlService.audio.skip(device_id, executed);
    }

    function canUpdate(err) {
      if(err) {
        log('user does not have permission to update device['+device_id+'] to stream['+stream_id+'] err['+err+']');
        return res.notFound();
      }

      return DeviceStateService.subscribe(device_id, stream_id, finish);
    }

    function foundStream(err, stream) {
      if(err) {
        log('failed finding stream to path to: '+err);
        return res.serverError(err);
      }

      found_stream = stream;

      if(stream.privacy < 2) 
        return DeviceStateService.subscribe(device_id, stream_id, finish);

      var levels = StreamPermissionManager.LEVELS,
          mask = levels.OWNER | levels.MANAGER | levels.CONTRIBUTOR;

      return StreamPermissionManager.is(current_user, stream_id, mask, canUpdate);
    }

    function foundPermissions(err, permissions) {
      if(err) { 
        log('failed looking up device permissions for state patch: '+err);
        return res.serverError(err);
      }

      if(permissions.length < 0) return res.notFound();

      // checking device permission level
      var level = permissions[0].level,
          levels = DeviceShareService.LEVELS,
          mask = levels.DEVICE_FRIEND | levels.DEVICE_OWNER;

      // invalid device permission level
      if(!(mask & level)) return res.notFound();

      // we're unsubscribing - special case
      if(stream_id === 0) {
        return DeviceStateService.subscribe(device_id, 0, finish);
      }
          
      return Stream.findOne(stream_id).exec(foundStream);
    }

    Devicepermission.find({user: current_user, device: device_id}).exec(foundPermissions);
  };

  DeviceStateController.update = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        auth_info = DeviceAuthentication.parseRequest(req),
        state_info = req.body;

    if(!auth_info) {
      log('attempt made to update device state without any auth info');
      return res.forbidden();
    }
 
    if(!state_info)
      return res.badRequest('no state data');
   
    function finish(err) {
      if(err) {
        log(err);
        return res.notFound();
      }


      log('device['+device_id+'] successfully updated to state['+JSON.stringify(state_info)+']');
      DeviceSockets.users.broadcast(device_id, 'DEVICE_STATE');
      return res.status(200).send('');
    }

    function foundDevice(err, device) {
      if(err || !device) {
        log('errored or unable to find device - err['+err+']');
        return res.forbidden();
      }

      DeviceStateService.update(device_id, state_info, finish);
    }

    Device.findOne({token: auth_info.token}).exec(foundDevice);
  };

  return DeviceStateController;

})();
