module.exports = (function() {

  var DevicePermission = {};

  DevicePermission.tableName = 'device_user_mapping';

  DevicePermission.attributes = {

    user: {
      model: 'user',
      required: true
    },

    device: {
      model: 'device',
      required: true
    },

    level: {
      type: 'integer',
      required: true
    }

  };

  return DevicePermission;

})();

