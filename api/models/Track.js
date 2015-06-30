var Soundcloud = require('../services/Soundcloud');

module.exports = (function() {

  var Track = {};

  Track.attributes = {

    title: {
      type: 'string',
    },

    uuid: {
      type: 'string',
      required: true
    },

    year: {
      type: 'integer'
    },

    provider: {
      type: 'string',
      regex: /SC|LF/i
    },

    album: {
      model: 'album'
    },

    artist: {
      model: 'artist'
    },

    streamUrl: function() {
      var provider = this.provider,
          result = "";

      switch(provider) {
        case "LF":
          var url_base = process.env['STORAGE_URL'];
          result = [url_base, this.uuid].join('/');
          break;
        case "SC":
          result = Soundcloud.streamUrl(this);
          break;
      }

      return result;
    }

  };

  return Track;

})();
