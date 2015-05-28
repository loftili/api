module.exports = (function() {

  var DeviceAuthentication = {},
      TOKEN_HEADER = 'x-loftili-device-token',
      SERIAL_HEADER = 'x-loftili-device-serial';

  DeviceAuthentication.parseRequest = function(req) {
    var serial = req.headers[SERIAL_HEADER],
        token = req.headers[TOKEN_HEADER];

    return serial && token ? {serial: serial, token: token} : false;
  };

  return DeviceAuthentication;

})();
