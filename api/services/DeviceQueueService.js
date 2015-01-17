module.exports = (function() {

  var DeviceQueueService = {},
      KEY_DELIM = ':';

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
        device_key = auth_info.device;

    function foundDevice(err, device) {
      if(err) {
        sails.log('[DeviceQueueService][validatePermission] failed getting device['+device_id+']');
        return callback(err, null);
      }

      if(!device) {
        sails.log('[DeviceQueueService][validatePermission] failed getting device['+device_id+']');
        return callback('no device', null);
      }
      
      sails.log('[DeviceQueueService][validatePermission] found device, checking permissions device[' + device.name + ']');

      if(device_key) {
        sails.log('[DeviceQueueService][validatePermission] validating permission based on the device\'s token...');
        sails.log('[DeviceQueueService][validatePermission] expected['+device.token+'] actual['+device_key+']');

        if(device.token !== device_key) {
          return callback('no permission to act', null);
        }

        return callback(null, device);
      }

      var permissions = device.permissions,
          levels = DeviceShareService.LEVELS,
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

      if(allowed) {
        sails.log('[DeviceQueueService][validatePermission] permissions check out, getting queue for device[' + device.name + ']');
        callback(null, device);
      } else {
        sails.log('[DeviceQueueService][validatePermission] permission failed for device[' + device.name + ']');
        callback('not allowed', null);
      }
    }

    Device.findOne(device_id).populate('permissions').exec(foundDevice);
  }

  DeviceQueueService.current = function(device_id, requester, callback) {
    var client;

    function finish(err, track) {
      if(err) {
        return callback(err, null)
      }

      sails.log('[DeviceQueueService][current] found current['+track+']');
      return callback(null, track);
    }

    function getTrack(err, value) {
      if(err) {
        sails.log('[DeviceQueueService][current] failed translating tracks');
        sails.log(err);
        client.connection.quit();
        return callback(err, null)
      }

      client.connection.quit();
      var track_id = parseInt(value, 10);
      sails.log('[DeviceQueueService][current] populating track');
      Track.findOne(track_id).exec(finish);
    }

    function getCurrent(err, device) {
      if(err) {
        client.connection.quit();
        return callback(err, null);
      }

      var keyname = currentKey(device_id);
      sails.log('[DeviceQueueService][current] asking for queue for device['+device.name+'], keyname['+keyname+']');
      client.connection.get(keyname, getTrack);
    }

    function connected(error) {
      if(error) {
        sails.log('[DeviceQueueService][current] redis server failed connection');
        client.connection.quit();
        return callback('redis fail');
      }

      sails.log('[DeviceQueueService][current] looking up device information for device['+device_id+']');
      validatePermission(device_id, requester, getCurrent);
    }

    client = RedisConnection.getClient(connected);
  };

  DeviceQueueService.find = function(device_id, requester, callback) {
    var client,
        queue_ids = [];

    function finish(err, tracks) {
      if(err) {
        return callback(err, null)
      }

      sails.log('[DeviceQueueService][find] found queue['+queue_ids.join()+']');

      var results = [];
      for(var i = 0; i < queue_ids.length; i++){
        var queued_id = queue_ids[i];

        for(var j = 0; j < tracks.length; j++) {
          var track = tracks[j];

          if(track.id === queued_id) {
            results.push(track);
            break;
          }
        }
      }

      return callback(null, results);
    }

    function getTracks(err, values) {
      if(err) {
        sails.log('[DeviceQueueService][find] failed translating tracks');
        sails.log(err);
        client.connection.quit();
        return callback(err, null)
      }

      client.connection.quit();

      for(var i = 0; i < values.length; i++) {
        var val = values[i],
            id = parseInt(val, 10);

        queue_ids.push(id);
      }

      sails.log('[DeviceQueueService][find] populating tracks');
      Track.find().where({id: queue_ids}).exec(finish);
    }

    function getQueue(err, device) {
      if(err) {
        client.connection.quit();
        return callback(null, err);
      }

      var keyname = listKey(device_id);
      sails.log('[DeviceQueueService][find] asking for queue for device['+device.name+'], keyname['+keyname+']');
      client.connection.lrange(keyname, 0, -1, getTracks);
    }

    function connected(error) {
      if(error) {
        sails.log('[DeviceQueueService][find] redis server failed connection');
        client.connection.quit();
        return callback('redis fail');
      }

      sails.log('[DeviceQueueService][find] looking up device information for device['+device_id+']');
      validatePermission(device_id, requester, getQueue);
    }

    client = RedisConnection.getClient(connected);
  };

  DeviceQueueService.pop = function(device_id, requester, callback) {
    var found_device,
        found_track,
        popped_id;

    function afterAdded(err) {
      if(err) {
        sails.log('[DeviceQueueService][pop] failed adding the popped track back into the queue');
        return callback(err, null);
      }

      sails.log('[DeviceQueueService][pop] successfully pushed a track after it was popped');
      return callback(null, found_track);
    }

    function foundTrack(err, track) {
      if(err) {
        sails.log('[DeviceQueueService][pop] unable to find the track that was popped, errored');
        return callback(err, null);
      }

      sails.log('[DeviceQueueService][pop] found a track from popped information');
      found_track = track;

      if(found_device.loop_flag && track) {
        DeviceQueueService.enqueue(device_id, track.id, requester, afterAdded);
      } else {
        return callback(null, track);
      }
    }

    function getTrack(err) {
      var value = popped_id;

      client.connection.quit();

      if(err) {
        sails.log('[DeviceQueueService][pop] unable to pop: '+err);
        return callback(err, null);
      }

      if(value) {
        sails.log('[DeviceQueueService][pop] popped a track: '+value);
        Track.findOne(value).exec(foundTrack);
      } else {
        sails.log('[DeviceQueueService][pop] end of queue, nothing to pop!');
        return callback(null, null);
      }
    }

    function setCurrent(err, value) {
      if(err) {
        sails.log('[DeviceQueueService][pop] unable to pop: '+err);
        return callback(err, null);
      }

      var keyname = currentKey(device_id);
      popped_id = value;
      client.connection.set(keyname, value, getTrack);
    }

    function doPop(err, device) {
      if(err) {
        client.connection.quit();
        return callback(err, null);
      }

      found_device = device;
      sails.log('[DeviceQueueService][pop] lpopping from queue');
      var keyname = listKey(device_id);
      client.connection.lpop(keyname, setCurrent);
    }

    function connected(error) {
      if(error) {
        sails.log('[DeviceQueueService][pop] redis server failed connection');
        client.connection.quit();
        return callback('redis fail');
      }

      sails.log('[DeviceQueueService][pop] looking up device information for device['+device_id+']');
      validatePermission(device_id, requester, doPop);
    }

    client = RedisConnection.getClient(connected);
  };

  DeviceQueueService.remove = function(device_id, item_position, requester, callback) {
    var client,
        new_list = [];

    function finish(err, new_list) {
      if(err) {
        sails.log('[DeviceQueueService][remove] failed lpushing new list, err['+err+']');
        return callback('failed making new list!', null);
      }

      sails.log('[DeviceQueueService][remove] new list has been made! returning new list');
      return DeviceQueueService.find(device_id, requester, callback);
    }

    function reAdd(err) {
      if(err) {
        sails.log('[DeviceQueueService][remove] failed getting track queue, exiting');
        return callback('failed deleting previous key list', null);
      }

      var keyname = listKey(device_id),
          lpush_args = [keyname].concat(new_list).concat([finish]);

      if(new_list.length > 0)
        client.connection.lpush.apply(client.connection, lpush_args);
      else
        finish();
    }

    function foundList(err, list) {
      if(err) {
        sails.log('[DeviceQueueService][remove] failed getting track queue, exiting');
        return callback('failed list retrieve', null);
      }

      if(!list || item_position > list.length - 1) {
        sails.log('[DeviceQueueService][remove] the requested queue does not exist or is not long enough');
        return callback('invalid position', null);
      }

      var keyname = listKey(device_id);

      for(var i = 0; i < list.length; i++) {
        if(i === item_position)
          continue;

        new_list.push(list[i]);
      }

      sails.log('[DeviceQueueService][remove] BLOWING AWAY OLD. found queue list['+list+'] new list['+new_list+']');
      client.connection.del(keyname, reAdd);
    }

    function doRemove(err, device) {
      if(err) {
        sails.log('[DeviceQueueService][remove] failed validating permissions, exiting');
        client.connection.quit();
        return callback('permission fail');
      }

      var keyname = listKey(device_id);
      sails.log('[DeviceQueueService][remove] removing from queue['+keyname+'] position['+item_position+']');
      client.connection.lrange(keyname, 0, -1, foundList);
    }

    function connected(error) {
      if(error) {
        sails.log('[DeviceQueueService][remove] failed connecting to the redis server');
        client.connection.quit();
        return callback('redis fail');
      }

      sails.log('[DeviceQueueService][remove] looking up permissions before removing');
      validatePermission(device_id, requester, doRemove);
    }

    client = RedisConnection.getClient(connected);
  };

  DeviceQueueService.enqueue = function(device_id, track_id, requester, callback) {
    var client;

    function finish(err, results) {
      return callback(null, results);
    }

    function added(err, result) {
      if(err) {
        sails.log('[DeviceQueueService][enqueue] failed getting queue for ['+device_id+']');
        sails.log(err);
        return callback(err, null)
      }

      client.connection.quit();
      DeviceQueueService.find(device_id, requester, finish);
    }

    function enqueue(err, device) {
      if(err) {
        client.connection.quit();
        return callback(err, null);
      }

      var keyname = listKey(device_id);
      sails.log('[DeviceQueueService][enqueue] lpushing into list['+keyname+'] track['+track_id+']');
      client.connection.send_command('rpush', [keyname, track_id], added);
    }

    function connected(error) {
      if(error) {
        sails.log('[DeviceQueueService][enqueue] redis server failed connection');
        client.connection.quit();
        return callback('redis fail');
      }

      sails.log('[DeviceQueueService][enqueue] looking up device information for device['+device_id+']');
      validatePermission(device_id, requester, enqueue);
    }

    function foundTrack(err, track) {
      if(err || !track) {
        sails.log('[DeviceQueueService][enqueue] could not find a track per request');
        return callback('missing track');
      }
      client = RedisConnection.getClient(connected);
    }

    Track.findOne(track_id).exec(foundTrack);
  };

  return DeviceQueueService;

})();
