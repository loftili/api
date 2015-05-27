var crypto = require('crypto'),
    isAdmin = require('../policies/admin');

module.exports = (function() {

  var DeviceSerialController = {};

  function log(msg) {
    sails.log('[DeviceSerialController]['+new Date()+'] ' + msg);
  }

  DeviceSerialController.findOne = function(req, res) {
    var id = req.params.id;

    function found(err, serial) {
      if(err) return res.serverError(err);
      return serial ? res.json(serial) : res.notFound();
    }

    return DeviceSerial.findOne({id: id}).populate('devices').exec(found);
  };

  DeviceSerialController.destroy = function(req, res) {
    var id = req.params.id;
    function destroyed(err) {
      if(err) return res.serverError(err);
      return res.status(200).send('');
    }

    function found(err, serial) {
      if(err) return res.serverError(err);
      return serial ? serial.destroy(destroyed) : res.notFound();
    }

    log('destroying ['+id+']');
    return DeviceSerial.findOne({id: id}).populate('devices').exec(found);
  };

  DeviceSerialController.find = function(req, res) {
    var device_id = parseInt(req.query.device, 10),
        user_id = parseInt(req.session.userid, 10);

    function filter(serials) {
      var result = [],
          count = serials.length;

      for(var i = 0; i < count; i++) {
        var serial = serials[i];
        if(serial.devices.length == 1) result.push(serial);
      }

      count = result.length;
      var devices = [];
      for(var i = 0; i < count; i++) {
        var serial = result[i],
            device = serial.devices[0];
        devices.push(device.id);
      }

      function callback(is_admin) {
        return is_admin ? res.json(result) : res.forbidden();
      }

      isAdmin.check(user_id, callback);
    }

    function found(err, serials) {
      if(err) return res.serverError(err);
      return device_id >= 0 ? filter(serials) : res.json(serials);
    }

    if(device_id > 0)
      return DeviceSerial.find().populate('devices', {id: device_id}).exec(found);

    function getAll() {
      return DeviceSerial.find().populate('devices').exec(found);
    }

    return isAdmin(req, res, getAll);
  };

  DeviceSerialController.create = function(req, res) {
    var body = req.body,
        number = body.serial;

    function created(err, serial) {
      if(err) return res.serverError(err);
      return res.json(serial);
    }

    function create() {
      DeviceSerial.create({serial_number: number}).exec(created);
    }

    function auto() {
      function generated(err, buf) {
        if(err) return res.serverError(err);
        number = buf.toString('hex').substr(0,40);
        create();
      }
      crypto.randomBytes(40, generated);
    }

    return number && number.length == 40 ? create() : auto();
  };

  return DeviceSerialController;

})();
