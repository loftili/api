module.exports = (function() {

  var DeviceStreamController = {};

  function log(msg) {
    var msg = [
      '[DeviceSocketController]',
      '['+(new Date())+']'
    ].join('') + ' ' + msg;

    sails.log(msg);
  }

  DeviceStreamController.subscribe = function(req, res) {
    if(!req.isSocket) return res.notFound();
    var socket_id = sails.sockets.id(req.socket),
        user_id = parseInt(req.session.userid, 10),
        device_id = parseInt(req.params.id, 10),
        new_id;

    if(!(user_id > 0)) return res.forbidden();

    if(!(device_id > 0)) return res.badRequest('');

    log('user['+user_id+'] trying to listen to device['+device_id+']');

    function hasPermission(err, permissions) {
      if(err) {
        log(err);
        return res.badRequest();
      }

      if(permissions.length < 1) return res.notFound();

      log('user checks out, adding');
      DeviceSockets.users.add(user_id, device_id, req.socket);
    }

    Devicepermission.find({device: device_id, user: user_id}).exec(hasPermission);
  };

  DeviceStreamController.open = function(req, res) {
    var query = req.query,
        serial = req.headers['x-loftili-device-serial'],
        token = req.headers['x-loftili-device-token'];

    function found(err, matching_serials) {
      if(matching_serials.length !== 1 || matching_serials[0].devices.length !== 1)
        return res.badRequest();

      var serial = matching_serials[0],
          device = serial.devices[0];

      return device.token === token ? DeviceSockets.add(req.socket, device.id) : res.badRequest('invalid device credentials [1]');
    }

    log('looking for serials matching: ' + serial);
    DeviceSerial.find({serial_number: serial}).populate('devices').exec(found);
  };

  return DeviceStreamController;

})();
