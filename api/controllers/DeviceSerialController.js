var crypto = require('crypto');

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
    function found(err, serials) {
      if(err) return res.serverError(err);
      res.json(serials);
    }
    return DeviceSerial.find().populate('devices').exec(found);
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
