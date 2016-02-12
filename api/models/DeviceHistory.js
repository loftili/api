module.exports = (function() {

  var DeviceHistory = { };

  DeviceHistory.tableName = "device_history";

  DeviceHistory.attributes = {

    track: {
      model: "track"
    },
  
    device: {
      model: "device"
    }

  };

  return DeviceHistory;

})();
