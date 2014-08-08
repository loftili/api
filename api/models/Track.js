module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    artist: {
      model: 'artist'
    },

    users: {
      collection: 'user',
      via: 'tracks',
      dominant: true
    }

  }

};

