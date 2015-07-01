module.exports = (function() {

  var StreamPermission = {};

  StreamPermission.tableName = 'stream_user_mapping';

  StreamPermission.attributes = {

    user: {
      model: 'user',
      required: true
    },

    stream: {
      model: 'stream',
      required: true
    },

    level: {
      type: 'integer',
      required: true
    }

  };

  return StreamPermission;


})();
