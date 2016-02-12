module.exports = (function() {

  var DeviceStreamMapping = {};

  DeviceStreamMapping.tableName = "device_stream_mapping";

  DeviceStreamMapping.attributes = {

    device: {
      model: "device"
    },

    stream: {
      model: "stream"
    },

    alpha: {
      type: "boolean"
    }

  };

  return DeviceStreamMapping;

})();
