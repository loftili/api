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

    last_name: {
      type: 'string',
      required: true
    },

    password: {
      type: 'string',
      required: true,
      minLength: 6
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

  beforeCreate: function(values, cb) {

    bcrypt.hash(values.password, 10, function(err, hash) {
      if(err) 
        return cb(err);

      values.password = hash;
      cb();
    });

  }

};

