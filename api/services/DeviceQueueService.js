var Logger = require('../services/Logger');

module.exports = (function() {

  var DeviceQueueService = {},
      KEY_DELIM = ':',
      log = Logger("DeviceQueueService");

  function keyName(device_id) {
    return ['queue', device_id].join(KEY_DELIM);
  }

  function listKey(device_id) {
    var base = keyName(device_id);
    return [base, 'tracks'].join(KEY_DELIM);
  }

  function currentKey(device_id) {
    var base = keyName(device_id);
    return [base, 'current'].join(KEY_DELIM);
  }

  function validatePermission(device_id, auth_info, callback) {
    var user_id = auth_info.user || auth_info,
        token = auth_info.token,
        serial = auth_info.serial;

    function foundDevice(err, device) {
      if(err) {
        log('failed getting device['+device_id+'] err['+err+']');
        return callback(err, null);
      }

      if(!device) {
        log('unable to find device['+device_id+']');
        return callback('no device', null);
      }
      
      if(token && serial) {
        if(device.token !== token) return callback('no permission to act', null);
        return callback(null, device);
      }

      var permissions = device ? device.permissions : [],
          levels = DevicePermissionManager.LEVELS,
          allowed = false;

      for(var i = 0; i < permissions.length; i++) {
        var permission = permissions[i],
            is_current_user = permission.user === user_id,
            level = permission.level;

        if(!is_current_user)
          continue;

        allowed = level === levels.DEVICE_OWNER || level === levels.DEVICE_FRIEND;
        break;
      }

      if(allowed)
        return callback(null, device);

      log('permission failed for device[' + device.name + ']');
      callback('not allowed', null);
    }

    Device.findOne(device_id).populate('permissions').exec(foundDevice);
  }

  function getStream(device_id, callback) {
    var stream_id = null;

    function foundStream(err, stream) {
      if(err) return callback(err);
      stream.id = stream_id;
      callback(null, stream);
    }

    function gotState(err, state) {
      if(err) return callback(err);
      stream_id = parseInt(state.stream, 10);
      if(stream_id > 0) log('device['+device_id+'] appears to be connected to a stream, getting stream');
      return stream_id > 0 ? StreamManager.find(stream_id, foundStream) : callback(null, false);
    }

    DeviceStateService.find(device_id, gotState);
  }

  DeviceQueueService.find = function(device_id, requester, callback) {
    function getQueue(err, device) {
      if(err) return callback(err);
      getStream(device_id, callback);
    }

    validatePermission(device_id, requester, getQueue);
  };

  DeviceQueueService.pop = function(device_id, requester, callback) {
    var found_stream, 
        target_track, 
        found_mapping;

    function finished(err) {
      if(err) return callback(err);
      return callback(null, target_track);
    }

    function removed(err, new_list) {
      if(err) return callback(err);
      StreamManager.enqueue(found_stream.id, target_track.id, finished);
    }

    function realPop() {
      log('alpha has finished! popping track from stream');
      StreamManager.remove(found_stream.id, 0, removed);
    }

    function madeHistory(err, history) {
      return found_mapping.alpha ? realPop() : callback(null, target_track);
    }

    function foundMapping(err, mapping) {
      if(err) return callback(err);
      if(!mapping) return callback('no mapping - invalid stream state');
      found_mapping = mapping;
      return DeviceHistory.create({device: device_id, track: target_track.id}).exec(madeHistory);    
    }

    function hasStream(err, stream) {
      if(err) return callback(err);
      found_stream = stream;
      if(!found_stream.queue || !(found_stream.queue.length > 0)) return callback(null, null);
      target_track = found_stream.queue[0];
      DeviceStreamMapping.findOne({device: device_id, stream: stream.id}).exec(foundMapping);
    }

    function getStreamId(err) {
      if(err) return callback(err);
      getStream(device_id, hasStream);
    }
    validatePermission(device_id, requester, getStreamId);
  };

  return DeviceQueueService;

})();
