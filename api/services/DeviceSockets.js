module.exports = (function() {

  var DeviceSockets = {},
      connected = [];

  function clean() {
    var i = 0,
        c = connected.length;

    for(i; i < c; i++) {
      if(connected[i] && !connected[i].writable) 
        connected.splice(i, 1);
    }
  }

  function log(msg) {
    sails.log('[::socket]['+new Date()+'] ' + msg);
  }

  DeviceSockets.add = function(socket) {
    connected.push(socket);
  };

  DeviceSockets.emit = function(msg) {
    clean();
    var i = 0,
        c = connected.length;
    
    for(i; i < c; i++) {
      log('sending to socket['+i+']');
      connected[i].write('poop\r\n\r\n');
    }
  };

  return DeviceSockets;

})();
