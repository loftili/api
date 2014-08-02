var bcrypt = require('bcrypt');

module.exports = {

  migrate: 'drop',

  attributes: {

    email: {
      type: 'string',
      required: true
    },

    devices: {
      collection: 'device',
      via: 'owner'
    },

    password: {
      type: 'string',
      required: true
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

