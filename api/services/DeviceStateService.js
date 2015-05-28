var Logger = require('./Logger');


module.exports = (function() {

  var DeviceStateService = {},
      log = Logger('DeviceStateService');

  function stateKey(device_id) {
    return ['device', device_id, 'state'].join(':');
  }

  DeviceStateService.find = function(device_id, callback) {
    var key_name = stateKey(device_id),
        client;

    function finish(err, state_info) {
      client.connection.quit();

      if(err) {
        return callback(err);
      }

      if(!state_info) {
        return callback('no state info available');
      }

      return callback(null, state_info);
    }

    function connected(err) {
      if(err) {
        return callback(err);
      }

      log('connected to redis, running find sequence');
      client.connection.hgetall(key_name, finish);
    }

    client = RedisConnection.getClient(connected);
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
