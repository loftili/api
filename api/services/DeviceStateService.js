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
      var c = mappings.length;

      // no mappings all across the board - takeover
      if(c === 0)
        return DeviceStreamMapping.create({stream: stream_id, device: device_id, alpha: true}).exec(finished);

      // if there is only one mapping, and it came from this 
      // device, the device is switching to a stream without
      // an alpha (it has no subscribers) - take over
      if(c === 1 && mappings[0].device === device_id) {
        mappings[0].stream = stream_id;
        mappings[0].alpha = true;
        return mappings[0].save(finished);
      }

      for(var i = 0; i < c; i++) {
        var mapping = mappings[i],
            dev = mapping.device;

        if(dev !== device_id) continue;
        mapping.stream = stream_id;
        mapping.alpha = false;
        return mapping.save(finished);
      }
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

      log('[DeviceStateService][update] connected to redis, running update sequence');

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
