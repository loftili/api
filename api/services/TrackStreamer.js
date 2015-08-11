var Logger = require('./Logger'),
    http = require('http'),
    https = require('https');

module.exports = (function() {

  var TrackStreamer = {},
      log = Logger('TrackStreamer');

  TrackStreamer.pipe = function(track, response) {
    var initial_url = track.streamUrl();

    function connected(stream) {
      var h = stream.headers;
      log('received status['+stream.statusCode+'] from url');

      if(stream.statusCode > 300 && stream.statusCode < 400) {
        var location = stream.headers['location'];
        log('received redirect to ['+location+']');
        return proxy(location);
      }

      stream.pause();
      response.writeHeader(stream.statusCode, stream.headers);
      stream.pipe(response);
      stream.resume();
    }

    function fail() {
      log('failed getting stream');
      return res.notFound('bad attempt [0]');
    }

    function proxy(url) {
      var r = (/^https:\/\//i.test(url) ? https : http).get(url, connected);
      log('attempting to pipe ['+url+']');
      r.on('error', fail);
    }

    proxy(initial_url);
  };

  return TrackStreamer;

})();
