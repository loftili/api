var crypto = require('crypto'),
    dotenv = require('dotenv');

module.exports = (function() {

  var DeviceTokenService = {};

  dotenv.load();

  DeviceTokenService.generate = function(device_name) {
    var device_token = process.env['DEVICE_SECRET'],
        token_unhashed = [device_token, device_name].join(':'),
        hasher = crypto.createHash('sha1');

    hasher.setEncoding('base64');
    hasher.write(token_unhashed);
    hasher.end();

    return hasher.read();
  };

  return DeviceTokenService;

})();
