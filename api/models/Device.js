module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    registered_name: {
      type: 'string',
      required: true
    },

    serial_number: {
      type: 'string',
      required: true,
      minLength: 40,
      size: 40
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

