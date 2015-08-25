var Logger = require('./Logger'),
    request = require('request'),
    crypto = require('crypto');

module.exports = (function() {

  var Lftxs = {},
      log = Logger('Soundcloud'),
      LFTXS_HOME = process.env['LFTXS_HOME'],
      ID_KEY = process.env['LFTXS_ID_AES_KEY'] || '123456789';

  function getArtistName(data) {
    var artists = data['Artists'],
        main = artists.length > 0 ? artists[0]['Artist'] : false;

    return main ? main['Name'] : false;
  }

  function encryptId(id) {
    var cipher = crypto.createCipher('aes-128-cbc', ID_KEY),
        id_buffer = new Buffer(id);

    return Buffer.concat([
      cipher.update(id_buffer),
      cipher.final()
    ]).toString('hex');
  };
  
  function decryptId(id) {
    var cipher = crypto.createDecipher('aes-128-cbc', ID_KEY),
        id_buffer = new Buffer(id, 'hex');

    return Buffer.concat([
      cipher.update(id_buffer),
      cipher.final()
    ]).toString('utf8');
  };

  Lftxs.translate = function(data) {
    var uuid = encryptId(data['Id']),
        result = {
          title: data['Name'],
          artist: {
            name: getArtistName(data)
          },
          provider: 'LFTXS',
          id: -1,
          foundAt: new Date(),
          pid: uuid,
          uuid: uuid
        };

    return result;
  };

  Lftxs.register = function(track_id, callback) {
    var decrypted_id = decryptId(track_id),
        reg_url = [LFTXS_HOME, decrypted_id, 'register'].join('/');

    function updated(err, data) {
      return callback(err, data ? data[0] : false);
    }

    function received(err, response, body) {
      var code = response ? response.statusCode : 999,
          data;

      log('lftxs to register['+decrypted_id+']: code['+code+']');

      if(err)
        return callback('unable to register');

      try {
        data = JSON.parse(body);
      } catch(e) { data = false; }

      if(!data)
        return callback('lftxs registration bad body');

      Track.update({
        id: data.id
      }, {
        provider: 'LFTXS',
        pid: track_id
      }, updated);
    }

    request.get(reg_url, received);
  }

  Lftxs.search = function(query, callback) {
    var search_url = [LFTXS_HOME, 'search'].join('/');

    function fail(err, response, body) {
      var code = response ? response.statusCode : -1;
      log('failed lftxs search; body['+body+'], code['+(code)+'] err['+err+']');

      return callback({
        message: 'lftxs error',
        code: code
      });
    }

    function receive(err, response, body) {
      if(err || response.statusCode !== 200)
        return fail(err, response, body);

      var tracks, cleansed = [];

      try {
        var data = JSON.parse(body);
        tracks = data['Tracks'] ? data['Tracks']['Items'] : false;
      } catch(e) { tracks = false; }

      if(!tracks) {
        return callback({messge: 'invalid lftxs body'});
      }

      var count = tracks.length;

      for(var i = 0; i < count; i++) {
        var t = tracks[i],
            c = Lftxs.translate(t);

        cleansed.push(c);
      }

      callback(false, cleansed);
    }

    request.get(search_url, {
      qs: {q: query}
    }, receive);
  };

  return Lftxs;

})();
