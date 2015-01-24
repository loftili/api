var request = require('request'),
    domains = require('../../config/domain');

module.exports = (function() {

  var DeviceControlService = {};

  function log(msg) {
    msg = ['[DeviceControlService]['+new Date()+']', msg].join(' ');
    sails.log(msg);
  }

  function sendRequest(api_path, device, requestCallback) {
    var ip_addr = device.ip_addr,
        port = device.port,
        request_url = 'http://'+ip_addr+':'+port+api_path,
        options = {
          url: request_url,
          headers: {
            'x-loftili-auth': device.token
          }
        };

    function finishedRequest(error, response, body) {
      var body_json;

      try {
        body_json = JSON.parse(body);
      } catch(e) {
        error = 'invalid body';
      }

      if(!error && response.statusCode == 200) {
        log('success request body['+body+']');
        return requestCallback(null, body_json);
      }

      log('failed request');
      return requestCallback(error);
    }

    log('sending request['+(request_url)+']');
    request(options, finishedRequest);
  }

  DeviceControlService.restart = function(device, callback) {
    log('restarting device['+device.registered_name+']');

    function finished(err, response) {
      return err ? callback(err) : callback(null, response);
    }

    sendRequest('/restart', device, finished);
  };

  DeviceControlService.start = function(device, callback) {
    log('starting device['+device.registered_name+']');

    function finished(err, response) {
      return err ? callback(err) : callback(null, response);
    }

    sendRequest('/start', device, finished);
  };

  DeviceControlService.stop = function(device, callback) {
    log('stopping device['+device.registered_name+']');

    function finished(err, response) {
      return err ? callback(err) : callback(null, response);
    }

    sendRequest('/stop', device, finished);
  };

  return DeviceControlService;

})();
