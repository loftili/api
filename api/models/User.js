var bcrypt = require('bcrypt'),
    crypto = require('crypto');

module.exports = (function() {

  var User = {};

  User.writable = [
    'email', 
    'password', 
    'first_name', 
    'last_name', 
    'privacy_level', 
    'username'
  ];

  User.public_read = [
    'gravatar_url',
    'id',
    'username'
  ];

  User.attributes = {

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

    roles: {
      collection: 'UserRoleMapping',
      via: 'user'
    },

    tracks: {
      collection: 'track',
      via: 'users',
      dominant: true
    },

    toJSON: function() {
      var obj = this.toObject(),
          email = obj.email,
          hasher = crypto.createHash('md5');
      hasher.update(email);
      obj['gravatar_url'] = 'https://gravatar.com/avatar/' + hasher.digest('hex');
      delete obj['password'];
      delete obj['reset_token'];
      return obj;
    }

  };

  User.beforeCreate = function(values, cb) {
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
  };

  return User;

})();

