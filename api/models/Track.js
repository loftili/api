module.exports = {

  attributes: {

    name: {
      type: 'string',
      required: true
    },

    type: {
      type: 'string',
      required: true
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

    users: {
      collection: 'user',
      via: 'tracks'
    },

    toJSON: function() {
      var obj = this.toObject(),
          url_base = process.env['STORAGE_URL'];

      obj.steaming_url = [url_base, obj.uuid].join('/');
      return obj;
    }

  }


};

