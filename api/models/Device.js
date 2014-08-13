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

    permissions: {
      collection: 'devicepermission',
      via: 'device'
    }

  },

  registerDomain: function(cb, user) {
    sails.log(this.name);
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

