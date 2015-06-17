module.exports = (function() {

  var Track = {};

  Track.attributes = {

    title: {
      type: 'string',
    },

    type: {
      type: 'string',
    },

    uuid: {
      type: 'string',
      required: true
    },

    year: {
      type: 'integer'
    },

    artist: {
      model: 'artist'
    },

    toJSON: function() {
      var obj = this.toObject(),
          url_base = process.env['STORAGE_URL'];

      delete obj.users;
      obj.streaming_url = [url_base, obj.uuid].join('/');
      return obj;
    }

  };

  return Track;

})();
