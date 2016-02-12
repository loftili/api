var Logger = require("./Logger");

module.exports = (function() {

  var DeviceSockets = { users: {} },
      connected = [],
      users = [],
      uuid = (function() {
        var i = 0;
        return (function() { return ["_", ++i, "_"].join(""); });
      })(),
      log = Logger("::DeviceSockets"),
      STATE_RESET = {
        connected: false
      };

  function clean() {
    var i = 0,
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i] && !connected[i].socket.writable) connected[i].cleanup();
    }
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
    log("removing user socket");
    var i = 0, l = users.length, f = -1;

    for(i; i < l; i++) {
      var us = users[i];
      if(us.user === user_id) f = i;
    }

    if(f < 0) return callback();

    users.splice(f, 1);
    log("successfully removed socket for user: " + user_id);
    callback();
  };

  DeviceSockets.users.broadcast = function(device_id, message) {
    var i = 0, l = users.length;

    function send(user) {
      log("broadcasting message["+message+"] to user["+user.user+"]");
      user.socket.emit("update", message);
    }

    for(i; i < l; i++) {
      if(users[i].device === device_id) send(users[i]);
    }
  };

  DeviceSockets.devices = function() {
    var result = [],
        i = 0,
        c = connected.length;

    for(i; i < c; i++) {
      result.push(connected[i].device);
    }

    return result;
  };

  DeviceSockets.add = function(socket, device_id) {
    var id = uuid(),
        noop = function() { };

    clean();

    function remove(callback) {
      var i = 0,
          n = -1;

      for(i; i < connected.length; i++) {
        var s = connected[i];
        if(s.id === id) { n = i; break; }
      }

      if(n < 0) return;

      function finish() {
        DeviceSockets.users.broadcast(device_id, "DEVICE_DISCONNECTED");

        if(callback && typeof(callback) === "function")
          callback();
      }

      log("removing socket at ["+n+"] and updating state");
      connected.splice(n, 1);
      DeviceStateService.update(device_id, STATE_RESET, finish);
    }

    function receiveData(data) {
      log("received data from device["+device_id+"]");
    }

    log("adding socket ["+id+"] for device["+device_id+"] and setting state");

    connected.push({
      device: device_id, 
      socket: socket, 
      id: id,
      cleanup: remove
    });

    DeviceStateService.update(device_id, {connected: true}, noop);
    DeviceSockets.users.broadcast(device_id, "DEVICE_CONNECTED");

    socket.on("close", remove);
    socket.on("data", receiveData);
  };

  DeviceSockets.remove = function(device_id, callback) {
    var i = 0,
        c = connected.length,
        f = false;

    for(i; i < c; i++) {
      if(!connected[i] || connected[i].device !== device_id)
        continue;

      f = connected[i];
      break;
    }

    if(!f)
      return callback("couldnt find matching device socket", false);

    function finish() {
      log("successfully removed device socket");
      callback(false, true);
    }

    f.cleanup(finish);
  };

  DeviceSockets.send = function(message, device_id, callback) {
    var i = 0, c = connected.length,
        d = false,
        device_ids = [];

    for(i; i < c; i++) device_ids.push(connected[i].device);

    i = 0;

    for(i; i < c; i++) {
      if(connected[i].device === device_id) { d = connected[i]; break; }
    }

    if(!d) {
      log("device socket not found - failed writing");
      return callback("missing device", false);
    }

    d.socket.write(message);
    return callback(null, "ok");
  };

  DeviceSockets.isConnected = function(device_id) {
    var i = 0, 
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i].device == device_id) return true;
    }

    return false;
  };

  return DeviceSockets;

})();
