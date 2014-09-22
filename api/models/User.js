var bcrypt = require('bcrypt');

module.exports = {

  attributes: {

    email: {
      type: 'string',
      required: true,
      unique: true,
      email: true
    },

    devices: {
      collection: 'devicepermission',
      via: 'user'
    },

    first_name: {
      type: 'string',
      required: true
    },

    privacy_level: {
      type: 'integer',
      defaultsTo: 1
    },

    role: {
      type: 'integer',
      defaultsTo: 1
    },

    last_name: {
      type: 'string',
      required: true
    },

    username: {
      type: 'string',
      required: true,
      unique: true
    },

    password: {
      type: 'string',
      required: true,
      minLength: 6
    },

    reset_token: {
      type: 'string',
      defaultsTo: null
    },

    tracks: {
      collection: 'track',
      via: 'users',
      dominant: true
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj['password'];
      return obj;
    }

  },

  beforeUpdate: function(values, cb) {
    function finish(err, ok) {
      if(err)
        cb(err);
      else
        cb();
    }

    HashService(values, 'password', finish);
  },

  beforeCreate: function(values, cb) {
    function finish(err, ok) {
      if(err)
        cb(err);
      else
        cb();
    }

    HashService(values, 'password', finish);
  }

};

