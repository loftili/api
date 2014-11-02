var http = require('http'),
    domains = require('../../config/domain');

module.exports = (function() {

  function send(method, user, device, track, callback) {
    var hostname = device.ip_addr,
        port = device.port,
        options = {
          hostname: hostname,
          port: port,
          path: ('/' + method),
          method: 'GET',
          headers: {
            "x-loftili-auth": user.username
          }
        },
        request = null,
        device_response = '',
        response_obj = null,
        device_response_overflow = false,
        sent = false;

    function receiveData(data) {
      if(device_response_overflow)
        return callback('device response overflow', false);

      sails.log('[DeviceControlService.send.receiveData] Received data: ' + data);
      device_response += data;

      if(device_response.length > 1e6)
        device_response_overflow = true;
    }

    function finish() {
      if(device_response_overflow)
        return errorHandler('device response buffer overflow');

      sails.log('[DeviceControlService.send.finish] Finished receiving response from device');
      sails.log('----------------------------------------');
      sails.log(device_response);
      sails.log('----------------------------------------');
      sent = true;
      callback(false, response_obj, device_response);
    }

    function requestHandler(res) {
      if(sent)
        return;

      res.setEncoding('utf8');
      response_obj = res;
      sails.log('[DeviceControlService.send.requestHandler] receiving response: ' + JSON.stringify(res.headers));

      if(!res.headers['x-loftili-version'])
        return errorHandler('missing loftili core header');

      res.on('data', receiveData);
      res.on('end', finish);
    }

    function errorHandler(e) {
      if(sent)
        return;

      sails.log('[DeviceControlService.send.error] Errored device com request ' + e);
      sent = true;
      request.abort();
      callback('errored request to device [' + e + ']', false);
    }

    function socketOpened(socket) {
      socket.setTimeout(500);  
      socket.on('timeout', errorHandler);
    }

    sails.log('[DeviceControlService.send.start] Opening http request to ' + hostname + ':' + port);
    request = http.request(options, requestHandler);
    request.on('socket', socketOpened);
    request.on('error', errorHandler);
    request.end();
  }

  return {

    start: function(user, device, track, callback) {
      var hostname = [device.name, user.username, 'lofti.li'].join('.'),
          port = device.port;

      function finish(error, res, body) {
        if(error)
          sails.log('[DeviceControlService.start.error] Errored playback request ERROR[' + error + ']');
        else
          sails.log('[DeviceControlService.start.success] Successfull playback request STATUS[' + res.statusCode + ']');

        callback(error, res, body);
      }

      sails.log('[DeviceControlService.start] Requesting playback on ' + hostname + ':' + port);
      send('start', user, device, track, finish);
    },

    stop: function(user, device, track, callback) {
      var hostname = [device.name, user.username, 'lofti.li'].join('.'),
          port = device.port;

      function finish(error, res, body) {
        if(error)
          sails.log('[DeviceControlService.stop.error] Errored playback request ERROR[' + error + ']');
        else
          sails.log('[DeviceControlService.stop.success] Successfully stopped playback on ' + hostname);

        callback(error, res, body);
      }

      sails.log('[DeviceControlService.stop] Requesting stop on ' + hostname + ':' + port);
      send('stop', user, device, track, finish);
    },

    ping: function(user, device, callback) {
      function finish(error, res, body) {
        if(error)
          sails.log('[DeviceControlService.ping.error] Errored ping request ERROR[' + error + ']');

        callback(error, res, body);
      }

      send('ping', user, device, null, finish);
    }

  };

})();
