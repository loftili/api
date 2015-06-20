module.exports = (function() {

  var Device = {};

  Device.attributes = {

    name: {
      type: 'string',
      required: true
    },

    registered_name: {
      type: 'string',
      required: true
    },

    serial_number: {
      model: 'DeviceSerial'
    },

    last_checked: {
      type: 'datetime'
    },

    token: {
      type: 'string'
    },

    loop_flag: {
      type: 'boolean',
      defaultsTo: true
    },

    permissions: {
      collection: 'Devicepermission',
      via: 'device'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj['token'];
      return obj;
    }

  };

  Device.beforeDestroy = function(criteria, cb) {
    var id = criteria.where.id;

    function destroyMappings(err, mappings) {
      for(var i = 0; i < mappings.length; i++) {
        mappings[i].destroy();
      }
      cb();
    }

    function destroyPermissions(err, permissions) {
      for(var i = 0; i < permissions.length; i++) {
        permissions[i].destroy();
      }
      DeviceStreamMapping.find({device: id}).exec(destroyMappings);
    }

    Devicepermission.find({device: id}).exec(destroyPermissions);
  };

  return Device;

})();
