var bcrypt = require('bcrypt');

module.exports = {

  writable: [
    'email', 
    'password', 
    'first_name', 
    'last_name', 
    'privacy_level', 
    'username'
  ],

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
      size: 20,
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
      delete obj['reset_token'];
      return obj;
    }

  },

  beforeCreate: function(values, cb) {
    function finish(err, ok) {
      if(err)
        cb(err);
      else
        cb();
    }

    if(values.email)
      values.email = (values.email+'').toLowerCase();

    if(values.username)
      values.username = (values.username+'').toLowerCase();

    HashService(values, 'password', finish);
  }

};

