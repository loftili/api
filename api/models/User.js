var bcrypt = require('bcrypt');

module.exports = {

  attributes: {

    email: {
      type: 'string',
      required: true
    },

    devices: {
      collection: 'DevicePermissions',
      via: 'user'
    },

    first_name: {
      type: 'string',
    },

    last_name: {
      type: 'string'
    },

    password: {
      type: 'string',
      required: true
    },

    tracks: {
      collection: 'track',
      via: 'users'
    },

    toJSON: function() {
      var a = this.toObject();
      delete a['password']
      return a;
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

