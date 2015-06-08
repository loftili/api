module.exports = (function() {

  var Stream = {};

  Stream.writable = [
    'title', 'description', 'privacy'
  ];

  Stream.attributes = {

    title: {
      type: 'string',
      required: true
    },

    description: {
      type: 'string',
      required: true
    },

    privacy: {
      type: 'integer',
      required: true,
      defaultsTo: 0
    },
    
    devices: {
      collection: 'Device',
      via: 'stream'
    },

    permissions: {
      collection: 'StreamPermission',
      via: 'stream'
    }

  };

  Stream.beforeDestroy = function(criteria, cb) {
    var id = criteria.where.id;

    function destroyPermissions(err, permissions) {
      for(var i = 0; i < permissions.length; i++) {
        permissions[i].destroy();
      }
      cb();
    }

    StreamPermission.find({stream: id}).exec(destroyPermissions);
  };

  return Stream;


})();
