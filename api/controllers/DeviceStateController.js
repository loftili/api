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

  DeviceStateController.playback = function(req, res) {
    var device_id = parseInt(req.params.id, 10),
        playback_state = parseInt(req.body.playback, 10),
        current_user = parseInt(req.session.userid, 10),
        valid_playback = playback_state === 0 || playback_state === 1;

    if(!valid_playback) return res.badRequest('invalid playback state [0]');

    function finished(err) {
      if(err) return res.badRequest('unable to stop device');
      return res.status(204).send('');
    }

    function stop() {
      return DeviceControlService.audio[playback_state ? 'start' : 'stop'](device_id, finished);
    }

    function canUpdate(can_update) {
      return can_update ? stop() : res.forbidden();
    }

    DevicePermissionManager.validate(device_id, current_user, canUpdate);
  }

  DeviceStateController.stream = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        stream_id = parseInt(req.body.stream, 10),
        current_user = parseInt(req.session.userid, 10),
        found_stream = null;

    if(isNaN(stream_id) || stream_id < 0) return res.badRequest('invalid stream id');


    function createdHistory(err, history) {
      if(err) {
        log('unable to execute device command based on stream update: '+err);
        return res.serverError();
      }

      return stream_id === 0 ? res.status(204).send('') : res.json(found_stream);
    }

    function executed(err) {
      if(err) {
        log('unable to execute device command based on stream update: '+err);
        return res.serverError();
      }

      DeviceStreamHistory.create({device: device_id, stream: stream_id}).exec(createdHistory);
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

    function checkPermission(can_update) {
      if(!can_update) { 
        log('failed looking up device['+device_id+'] user['+current_user+'] permissions for state patch');
        return res.forbidden('');
      }

      // we're unsubscribing - special case
      if(stream_id === 0)
        return DeviceStateService.subscribe(device_id, 0, finish);

      return Stream.findOne(stream_id).exec(foundStream);
    }

    DevicePermissionManager.validate(device_id, current_user, checkPermission);
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
