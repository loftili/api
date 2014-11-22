module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    last_checked: {
      type: 'datetime'
    },

    ip_addr: {
      type: 'string',
      regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/
    },

    token: {
      type: 'string'
    },

    port: {
      type: 'integer',
      defaultsTo: '80'
    },

    loop_flag: {
      type: 'boolean',
      defaultsTo: true
    },

    permissions: {
      collection: 'devicepermission',
      via: 'device'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj['token'];
      return obj;
    }

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

