module.exports = (function() {

  return {

    start: function(user, device, track, callback) {
      var hostname = [device.name, user.username, 'lofti.li'].join('.'),
          port = device.port;

      sails.log('[PlaybackService.start] Requesting playback on ' + hostname + ':' + port);
      callback();
    },

    stop: function(user, device, callback) {
      var hostname = [device.name, user.username, 'lofti.li'].join('.'),
          port = device.port;

      sails.log('[PlaybackService.start] Requesting stop on ' + hostname + ':' + port);
      callback();
    }

  };

})();
