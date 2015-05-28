var request = require('request'),
    domains = require('../../config/domain'),
    Logger = require('./Logger');

module.exports = (function() {

  var DeviceControlService = {},
      supported_engines = ['audio'],
      log = Logger('DeviceControlService');

  function sendRequest(command, device, requestCallback) {
    var message = "CMD " + command;

    function finished(err, state) {
      return requestCallback(err, state);
    }

    DeviceSockets.send(message, device.id, finished);
  }

  function engine(name) {
    var fns = {};

    fns.restart = function(device, callback) {
      log('restarting device['+device.registered_name+']');

      function finished(err, response) {
        if(err) return callback(err);
        log('device restarted succesfully');
        return callback(null, response);
      }

      sendRequest([name, 'restart'].join(':'), device, finished);
    };

    fns.start = function(device, callback) {
      log('starting device['+device.registered_name+']');

      function finished(err, response) {
        if(err) return callback(err);
        log('device started succesfully');
        return callback(null, response);
      }

      sendRequest([name, 'start'].join(':'), device, finished);
    };

    fns.stop = function(device, callback) {
      log('stopping device['+device.registered_name+']');

      function finished(err, response) {
        if(err) return callback(err);
        log('device stopped succesfully');
        return callback(null, response);
      }

      sendRequest([name, 'stop'].join(':'), device, finished);
    };

    fns.skip = function(device, callback) {
      log('skipping device['+device.registered_name+']');

      function finished(err, response) {
        if(err) return callback(err);
        log('device skipped succesfully');
        return callback(null, response);
      }

      sendRequest([name, 'skip'].join(':'), device, finished);
    };

    return fns;
  }

  while(supported_engines.length) {
    var name = supported_engines.pop();
    DeviceControlService[name] = engine(name);
  }

  return DeviceControlService;

})();
