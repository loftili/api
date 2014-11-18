var redis = require("redis");

module.exports = (function() {

  var DeviceQueueService = {};

  function getClient(ready_fn) {
    var connection = redis.createClient(),
        client = {},
        failed_connecting = false;

    function error(err) {
      sails.log('[REDIS ERROR] ' + err);
      client.error = err;

      if(!failed_connecting)
        ready_fn(err);

      failed_connecting = true;
    }

    function ready() {
      ready_fn(null);
    }

    connection.on('error', error);
    connection.on('ready', ready);

    client.connection = connection;

    return client;
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
        var expected = DeviceTokenService.generate(device.name);
        sails.log('[DeviceQueueService][validatePermission] validating permission based on the device\'s token...');
        sails.log('[DeviceQueueService][validatePermission] expected['+expected+'] actual['+device_key+']');
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

      sails.log('[DeviceQueueService][find] asking for queue for device['+device.name+']');
      var keynane = ['device', 'queue', device_id].join('_');
      client.connection.lrange(keynane, 0, -1, getTracks);
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

    client = getClient(connected);
  };

  DeviceQueueService.pop = function(device_id, requester, callback) {
    function foundTrack(err, track) {
      if(err) {
        sails.log('[DeviceQueueService][pop] unable to find the track that was popped, errored');
        return callback(err, null);
      }

      sails.log('[DeviceQueueService][pop] found a track from popped information');
      return callback(null, track);
    }

    function getTrack(err, value) {
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

    function doPop(err, device) {
      if(err) {
        client.connection.quit();
        return callback(err, null);
      }

      sails.log('[DeviceQueueService][pop] lpopping from queue');
      var keynane = ['device', 'queue', device_id].join('_');
      client.connection.lpop(keynane, getTrack);
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

    client = getClient(connected);
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

      var keynane = ['device', 'queue', device_id].join('_');
      sails.log('[DeviceQueueService][enqueue] lpushing into list['+keynane+'] track['+track_id+']');
      client.connection.send_command('lpush', [keynane, track_id], added);
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
      client = getClient(connected);
    }

    Track.findOne(track_id).exec(foundTrack);
  };

  return DeviceQueueService;

})();
