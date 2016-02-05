var request = require("request"),
    domains = require("../../config/domain"),
    Logger = require("./Logger");

module.exports = (function() {

  var DeviceControlService = {},
      supported_engines = ["audio"],
      log = Logger("DeviceControlService");

  function sendRequest(command, device, requestCallback) {
    var message = "CMD " + command;
    DeviceSockets.send(message, device, requestCallback);
  }

  function engine(name) {
    var fns = {};

    fns.restart = function(device, callback) {
      function finished(err, response) {
        if(err) return callback(err);
        log("device["+device+"] restarted succesfully");
        return callback(null, response);
      }

      sendRequest([name, "restart"].join(":"), device, finished);
    };

    fns.start = function(device, callback) {
      function finished(err, response) {
        if(err) return callback(err);
        log("device["+device+"] started succesfully");
        return callback(null, response);
      }

      sendRequest([name, "start"].join(":"), device, finished);
    };

    fns.stop = function(device, callback) {

      function finished(err, response) {
        if(err) return callback(err);
        log("device["+device+"] stopped succesfully");
        return callback(null, response);
      }

      sendRequest([name, "stop"].join(":"), device, finished);
    };

    fns.skip = function(device, callback) {
      function finished(err, response) {
        if(err) return callback(err);
        log("device["+device+"] skipped succesfully");
        return callback(null, response);
      }

      sendRequest([name, "skip"].join(":"), device, finished);
    };

    return fns;
  }

  while(supported_engines.length) {
    var name = supported_engines.pop();
    DeviceControlService[name] = engine(name);
  }

  return DeviceControlService;

})();
