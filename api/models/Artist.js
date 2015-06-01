module.exports = (function() {

  var Artist = {};

  Artist.attributes = {

    name: {
      type: 'string',
      required: true
    },

    tracks: {
      collection: 'track',
      via: 'artist'
    }

  };

  return Artist;

})();
