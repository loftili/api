module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    tracks: {
      collection: 'track',
      via: 'artist'
    }

  }

};

