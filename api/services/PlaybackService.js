var http = require('http');

module.exports = (function() {

  function send(method, user, device, track, callback) {
    var hostname = [device.name, user.username, 'lofti.li'].join('.'),
        port = device.port,
        options = {
          hostname: hostname,
          port: port,
          path: ('/' + method),
          method: 'GET',
        },
        request = null,
        device_response = '',
        response_obj = null,
        device_response_overflow = false;

    function receiveData(data) {
      if(device_response_overflow)
        callback('device response overflow', false);

      sails.log('[PlaybackService.send.receiveData] Received data: ' + data);
      device_response += data;

      if(device_response.length > 1e6)
        device_response_overflow = true;
    }

    function finish() {
      if(device_response_overflow)
        return;

      sails.log('[PlaybackService.send.finish] Finished receiving response from device');
      sails.log('----------------------------------------');
      sails.log(device_response);
      sails.log('----------------------------------------');
      callback(false, response_obj, device_response);
    }

    function requestHandler(res) {
      res.setEncoding('utf8');
      response_obj = res;
      res.on('data', receiveData);
      res.on('end', finish);
    }

    function errorHandler(e) {
      sails.log('[PlaybackService.send.error] Errored playback request ' + e);
      callback(e, false);
    }

    request = http.request(options, requestHandler);
    request.on('error', errorHandler);
    request.end();
  }

  return {

    start: function(user, device, track, callback) {
      var hostname = [device.name, user.username, 'lofti.li'].join('.'),
          port = device.port;

      function finish(error, res, body) {
        if(error)
          sails.log('[PlaybackService.start.error] Errored playback request ERROR[' + error + ']');
        else
          sails.log('[PlaybackService.start.success] Successfull playback request STATUS[' + res.statusCode + ']');

        callback(error, res, body);
      }

      sails.log('[PlaybackService.start] Requesting playback on ' + hostname + ':' + port);
      send('start', user, device, track, finish);
    },

    stop: function(user, device, track, callback) {
      var hostname = [device.name, user.username, 'lofti.li'].join('.'),
          port = device.port;

      function finish(error, res, body) {
        if(error)
          sails.log('[PlaybackService.stop.error] Errored playback request ERROR[' + error + ']');
        else
          sails.log('[PlaybackService.stop.success] Successfully stopped playback on ' + hostname);

        callback(error, res, body);
      }

      sails.log('[PlaybackService.stop] Requesting stop on ' + hostname + ':' + port);
      send('stop', user, device, track, finish);
    }

  };

})();
