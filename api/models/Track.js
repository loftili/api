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

    bucket_name: {
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
      via: 'tracks',
      dominant: true
    }

  },

  supported_types: ['mp3'],

  parseTags: function(model, tags) {
    var name = tags.title,
        name_cleaner = /^(.*)\.[mp3|wav|mp4]+$/;

    model.name = name.replace(name_cleaner, '$1');
    model.year = tags.year;
    model.artist_name = tags.artist;
    return model;
  },

  beforeCreate: function(values, cb) {
    var artist_name = values.artist_name;

    if(!artist_name)
      cb();

    Artist.findOrCreate({
      'name': artist_name
    }, {name: artist_name}, artist);

    function artist(err, artist) {
      if(err) 
        cb(err);

      values.artist = artist.id;

      cb();
    }
  }


};

