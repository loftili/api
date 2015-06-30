var Resource = require('../lib/Resource');

module.exports = (function() {

  var Soundcloud = {},
      api_url = 'https://api.soundcloud.com';

  Soundcloud.streamUrl = function(track) {
    var url = [api_url, 'tracks', track.uuid, 'stream'].join('/'),
        query = ['client_id', process.env['SOUNDCLOUD_CLIENT_ID']].join('=');

    return [url, query].join('?');
  };

  Soundcloud.Track = (function() {
    var url = [api_url, 'tracks/:id'].join('/'),
        mappings = {
          'id': '@id'
        },
        actions = {},
        config = {},
        query = {
          client_id: process.env['SOUNDCLOUD_CLIENT_ID']
        };

    return Resource(url, mappings, actions, config, query);

  })();

  Soundcloud.Track.translate = function(track) {
    var r = {
          id: -1,
          title: track.title,
          provider: 'SC',
          foundAt: new Date(),
          year: track.year,
          pid: track.id
        };

    return r;
  };

  return Soundcloud;

})();
