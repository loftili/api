module.exports = (function() {

  var DeviceStreamHistory = { };

  DeviceStreamHistory.tableName = 'device_stream_history';

  DeviceStreamHistory.attributes = {

    stream: {
      model: 'stream'
    },
  
    device: {
      model: 'device'
    }

  };

  return DeviceStreamHistory;

})();
