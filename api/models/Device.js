module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    hostname: {
      type: 'string'
    },

    status: {
      type: 'boolean',
      defaultsTo: false
    },

    last_checked: {
      type: 'datetime'
    },

    ip_addr: {
      type: 'string',
      regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    },

    port: {
      type: 'integer',
      defaultsTo: '80'
    },

    permissions: {
      collection: 'devicepermission',
      via: 'device'
    }

  },

  afterUpdate: function(device, cb) {
    sails.log('[device.afterUpdate] - Updating new dns records based on device\'s ip address: ' + device.ip_addr);

    function foundOwner(err, permission) {
      if(err || !permission)
        return cb();

      sails.log('[device.afterUpdate] - Found the user who owns ' + device.name);

      function finish() {
        return cb();
      }

      DnsManagerSerice.updateRecord(permission.user, device, finish)
    }

    Devicepermission.findOne({device: device.id, level: 1}).populate('user').exec(foundOwner);
  },

  beforeDestroy: function(criteria, cb) {
    var id = criteria.where.id;

    function destroyPermissions(err, permissions) {
      for(var i = 0; i < permissions.length; i++) {
        permissions[i].destroy();
      }
      cb();
    }

    Devicepermission.find({device: id}).exec(destroyPermissions);
  }

};

