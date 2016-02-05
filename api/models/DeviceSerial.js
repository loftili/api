module.exports = (function() {

  var DeviceSerial = {};

  DeviceSerial.tableName = "device_serial";

  DeviceSerial.attributes = {

    serial_number: {
      type: "string",
      required: true
    },

    devices: {
      collection: "Device",
      via: "serial_number"
    }

  };

  return DeviceSerial;

})();
