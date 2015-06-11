var Logger = require('./Logger');


module.exports = (function() {

  var DeviceStateService = {},
      log = Logger('DeviceStateService');

  function stateKey(device_id) {
    return ['device', device_id, 'state'].join(':');
  }

  DeviceStateService.find = function(device_id, callback) {
    var key_name = stateKey(device_id),
        client, found_info = null;

    function foundMapping(err, mapping) {
      found_info.stream = mapping ? mapping.stream : false;
      return callback(null, found_info);
    }

    function finish(err, state_info) {
      client.connection.quit();

      if(err) {
        return callback(err);
      }

      if(!state_info) {
        return callback('no state info available');
      }

      found_info = state_info;
      DeviceStreamMapping.findOne({device: device_id}).exec(foundMapping);
    }

    function connected(err) {
      if(err) {
        return callback(err);
      }

      client.connection.hgetall(key_name, finish);
    }

    client = RedisConnection.getClient(connected);
  };

  DeviceStateService.subscribe = function(device_id, stream_id, callback) {
    function finished(err, record) {
      if(err) return callback(err);
      callback(null, record);
    }

    function foundMappings(err, mappings) {
      if(err) return callback(err);
      var c = mappings.length,
          device_mapping,
          new_streams_alpha;

      // no mappings all across the board - takeover
      if(c === 0)
        return DeviceStreamMapping.create({stream: stream_id, device: device_id, alpha: true}).exec(finished);

      for(var i = 0; i < c; i++) {
        var mapping = mappings[i],
            dev = mapping.device;

        if(dev !== device_id) {
          if(mapping.alpha) new_streams_alpha = mapping;
          continue;
        }

        device_mapping = mapping;
      }

      function doMove() {
        // we're joining a stream without an alpha.
        if(!new_streams_alpha) {
          log('stream ['+stream_id+'] was without an alpha, assigning device['+device_id+']');
          device_mapping.alpha = true;
        } else {
          device_mapping.alpha = false;
        }

        device_mapping.stream = stream_id;
        device_mapping.save(finished);
      }

      function replaceAlpha(err, old_mappings) {
        if(err) callback(err);

        // the stream we're leaving only had us subscribed to it, just go ahead and move
        if(old_mappings.length === 1) {
          log('device['+device_id+'] is leaving stream['+stream_id+'] which only had a single device, no need to replace');
          return doMove();
        }

        for(var i = 0; i < old_mappings.length; i++) {
          if(old_mappings[i].device === device_id) continue;
          old_mappings[i].alpha = true;
          return old_mappings[i].save(doMove);
        }
      }

      // oh shit, we're leaving a stream we're the alpha of, assign a new one
      if(device_mapping.alpha === true) {
        var current_stream = device_mapping.stream;
        log('alpha device['+device_id+'] is leaving it\'s stream['+current_stream+'] - assigning a new alpha...');
        return DeviceStreamMapping.find({stream: current_stream}).exec(replaceAlpha);
      }

      return doMove();
    }

    DeviceStreamMapping.find({
      or: [{
        stream: stream_id
      }, {
        device: device_id
      }]
    }).exec(foundMappings);
  };

  DeviceStateService.update = function(device_id, state_info, callback) {
    var key_name = stateKey(device_id),
        state_map = [],
        finished_count = 0,
        client;

    for(var state_key in state_info) {
      if(state_info.hasOwnProperty(state_key)) state_map.push([state_key, state_info[state_key]]);
    }

    state_map.push(['timestamp', new Date().getTime()]);

    function finish(err) {
      if(err) {
        log('[DeviceStateService][update] errored durring redis - error['+err+']');
        client.connection.quit();
        return callback('redis error');
      }

      finished_count++;

      if(finished_count !== state_map.length)
        return;

      client.connection.quit();
      callback();
    }

    function connected(err) {
      if(err) {
        return callback(err);
      }

      var count = state_map.length;

      for(var i = 0; i < count; i++) {
        var map = state_map[i],
            key = map[0],
            val = map[1];

        client.connection.hset([key_name, key, val], finish);
      }
    }

    client = RedisConnection.getClient(connected);
  };

  return DeviceStateService;

})();
