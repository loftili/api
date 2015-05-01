module.exports = (function() {

  var DeviceSockets = { users: {} },
      connected = [],
      users = [],
      uuid = (function() {
        var i = 0;
        return (function() { return ['_', ++i, '_'].join(''); });
      })();

  function clean() {
    var i = 0,
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i] && !connected[i].socket.writable) {
        log("removing socket ["+i+"], no longer connected");
        connected.splice(i, 1);
      }
    }
  }

  function log(msg) {
    sails.log('[::socket]['+new Date()+'] ' + msg);
  }

  DeviceSockets.users.add = function(user, device, socket) {
    var new_id = uuid();

    users.push({
      user: user,
      device: device,
      socket: socket,
      id: new_id
    });
  };

  DeviceSockets.users.remove = function(user_id, callback) {
    log('removing user socket');
    var i = 0, l = users.length, f = -1;

    for(i; i < l; i++) {
      var us = users[i];
      if(us.user === user_id) f = i;
    }

    if(f < 0) return callback();

    users.splice(f, 1);
    callback();
    log('successfully removed socket for user: ' + user_id);
  };

  DeviceSockets.users.broadcast = function(device_id, message) {
    var i = 0, l = users.length;

    function send(user) {
      log("broadcasting message["+message+"] to user["+user.user+"]");
      user.socket.emit('update', message);
    }

    for(i; i < l; i++) {
      if(users[i].device === device_id) send(users[i]);
    }
  };

  DeviceSockets.add = function(socket, device_id) {
    var id = uuid();

    clean();

    function remove() {
      var i = 0,
          n = -1;

      for(i; i < connected.length; i++) {
        var s = connected[i];
        if(s.id === id) { n = i; break; }
      }

      if(n < 0) return;

      log("removing socket at ["+n+"]");
      connected.splice(n, 1);
      DeviceSockets.users.broadcast(device_id, "disconnected");
    }

    log("adding socket ["+id+"] for device["+device_id+"]");

    connected.push({
      device: device_id, 
      socket: socket, 
      id: id
    });

    DeviceSockets.users.broadcast(device_id, "connected");

    socket.on('close', remove);
  };

  DeviceSockets.send = function(message, device_id, callback) {
    var i = 0, c = connected.length,
        d = false,
        device_ids = [];

    for(i; i < c; i++) device_ids.push(connected[i].device);

    i = 0;
    log('searching for device['+device_id+'] in connected['+device_ids+']');

    for(i; i < c; i++) {
      if(connected[i].device === device_id) { d = connected[i]; break; }
    }

    if(!d)
      return callback('missing device', false);

    d.socket.write(message);
    return callback(null, 'ok');
  };

  return DeviceSockets;

})();
