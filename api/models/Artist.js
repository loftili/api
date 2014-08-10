module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    tracks: {
      collection: 'track',
      via: 'artist'
    },

  },

  beforeCreate: function(values, cb) {
    sails.log(values);
    cb();
  }

};

