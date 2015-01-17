var redis = require('redis');

module.exports = (function() {

  var RedisConnection = {};

  RedisConnection.getClient = function(ready_fn) {
    var connection = redis.createClient({
          max_attempts: 1
        }),
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

  return RedisConnection;

})();
