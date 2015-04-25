module.exports = (function() {

  var DeviceSockets = {},
      connected = [],
      uuid = (function() {
        var i = 0;
        return (function() { return ['_', ++i, '_'].join(''); });
      })();

  function clean() {
    var i = 0,
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i] && !connected[i].socket.writable) connected.splice(i, 1);
    }
  }

  function log(msg) {
    sails.log('[::socket]['+new Date()+'] ' + msg);
  }

  DeviceSockets.userConnection = function(session) {
  };

  DeviceSockets.add = function(socket) {
    var id = uuid();

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
    }

    log("adding socket ["+id+"]");
    connected.push({socket: socket, id: id});
    socket.on('close', remove);
  };

  DeviceSockets.emit = function(msg) {
    clean();
    var i = 0,
        c = connected.length;
    
    for(i; i < c; i++) {
      log('sending to socket['+i+']');
      connected[i].socket.write(msg+'\r\n\r\n');
    }
  };

  return DeviceSockets;

})();
