var Logger = require('./Logger');

module.exports = (function() {

  var StreamManager = {},
      log = Logger('StreamManager'),
      KEY_DELIM = ':';

  function keyName(stream_id) {
    return ['stream', stream_id].join(KEY_DELIM);
  }

  function listKey(stream_id) {
    var base = keyName(stream_id);
    return [base, 'tracks'].join(KEY_DELIM);
  }

  StreamManager.remove = function(stream_id, item_position, callback) {
    var client,
        new_list = [];

    function finish(err, new_list) {
      if(err) {
        log('failed lpushing new list, err['+err+']');
        return callback('failed making new list!', null);
      }

      log('finished removing item['+item_position+'] from stream['+stream_id+']');
      return StreamManager.find(stream_id, callback);
    }

    function reAdd(err) {
      if(err) {
        log('failed getting track queue ' + err);
        return callback('failed deleting previous key list', null);
      }

      var keyname = listKey(stream_id),
          lpush_args = [keyname].concat(new_list.reverse()).concat([finish]);

      if(new_list.length > 0) client.connection.lpush.apply(client.connection, lpush_args);
      else finish();
    }

    function foundList(err, list) {
      if(err) {
        log('failed getting track queue, exiting: ' + err);
        return callback('failed list retrieve', null);
      }

      if(!list || item_position > list.length - 1)
        return callback('invalid position', null);

      var keyname = listKey(stream_id);

      for(var i = 0; i < list.length; i++) {
        if(i === item_position) {
          log('skipping item at position['+item_position+']');
          continue;
        }

        new_list.push(list[i]);
      }

      log('BLOWING AWAY OLD. found queue list['+list+'] new list['+new_list+']');
      client.connection.del(keyname, reAdd);
    }

    function connected(error) {
      if(error) {
        log('failed connecting to the redis server');
        client.connection.quit();
        return callback('redis fail');
      }

      var keyname = listKey(stream_id);
      client.connection.lrange(keyname, 0, -1, foundList);
    }

    log('attempting to remove item['+item_position+'] from stream['+stream_id+']');
    client = RedisConnection.getClient(connected);
  };

  StreamManager.find = function(stream_id, callback) {
    var client,
        stream_tracks = [];

    function finish(err, tracks) {
      if(err) {
        return callback(err, null)
      }

      var results = [];
      for(var i = 0; i < stream_tracks.length; i++) {
        var queued_id = stream_tracks[i];

        for(var j = 0; j < tracks.length; j++) {
          var track = tracks[j];
          if(track.id === queued_id) {
            results.push(track);
            break;
          }
        }
      }

      return callback(null, {queue: results});
    }

    function getTracks(err, values) {
      if(err) {
        log('failed translating tracks: ' + err);
        client.connection.quit();
        return callback(err);
      }

      client.connection.quit();

      for(var i = 0; i < values.length; i++) {
        var val = values[i],
            id = parseInt(val, 10);
        stream_tracks.push(id);
      }

      Track.find().where({id: stream_tracks}).exec(finish);
    }

    function connected(err) {
      if(err) {
        log('failed connecting to redis');
        return callback(true);
      }

      var keyname = listKey(stream_id);
      client.connection.lrange(keyname, 0, -1, getTracks);
    }

    client = RedisConnection.getClient(connected);
  };

  StreamManager.enqueue = function(stream_id, track_id, callback) {
    var client;

    function finish(err, results) {
      return callback(null, results);
    }

    function added(err, result) {
      if(err) {
        log('failed getting queue for ['+stream_id+']' + err);
        return callback(err, null)
      }

      client.connection.quit();
      StreamManager.find(stream_id, finish);
    }

    function connected(err) {
      if(err) {
        log('failed connecting to redis');
        return callback(true);
      }

      var keyname = listKey(stream_id);
      client.connection.send_command('rpush', [keyname, track_id], added);
    }

    client = RedisConnection.getClient(connected);
  };

  return StreamManager;

})();
