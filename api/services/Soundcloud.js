var Resource = require("../lib/Resource"),
    Logger = require("./Logger");

module.exports = (function() {

  var Soundcloud = {},
      api_url = "https://api.soundcloud.com",
      log = Logger("Soundcloud");

  Soundcloud.streamUrl = function(track) {
    var url = [api_url, "tracks", track.uuid, "stream"].join("/"),
        query = ["client_id", process.env["SOUNDCLOUD_CLIENT_ID"]].join("=");

    return [url, query].join("?");
  };

  Soundcloud.Track = (function() {
    var url = [api_url, "tracks/:id"].join("/"),
        mappings = {
          "id": "@id"
        },
        actions = {},
        config = {},
        query = {
          client_id: process.env["SOUNDCLOUD_CLIENT_ID"]
        };

    return Resource(url, mappings, actions, config, query);
  })();

  Soundcloud.Track.translate = function(track) {
    var title = track.title,
        year = track.year,
        pid = track.id,
        valid = title && pid;

    return valid ? {title: title, id: -1, pid: pid, provider: "SC"} : false;
  };

  Soundcloud.search = function(query, callback) {
    var clean = [];

    function send(err, result) {
      if(err) return callback(false, clean);

      var b, c, l = 0,
          streamable = [],
          streamable_count = 0,
          titles = [];

      try { 
        b = JSON.parse(result.body);
      } catch(e) {
        b = false;
      }

      // soundcloud fetch bombed
      if(!b || !b.length)
        return callback(false, clean);

      c = b.length;

      function loadOne(err, data) {
        if(err) 
          return (++l === streamable_count) ? callback(false, clean) : false;

        var single;

        try { 
          single = JSON.parse(data.body);
        } catch(e) {
          single = false;
        }

        // we found a lie...
        if(!single || !single.streamable) {
          log("soundlcoud lied about track["+single.title+"] id["+single.id+"], which is NOT streamable");
          return (++l === streamable_count) ? callback(false, clean) : false;
        }

        var sc_id = single.id;
        single = Soundcloud.Track.translate(single);
        single.uuid = sc_id;
        clean.push(single);

        if(++l === streamable_count)
          return callback(false, clean);
      }

      // loop over the returned tracks, storing their ids
      for(var i = 0; i < c; i++) {
        var t = b[i];

        if(!t.streamable)
          continue;

        streamable.push(t.id+"");
        titles.push(t.title);
      }

      streamable_count = streamable.length;

      function checkDupes(err, tracks) {
        if(err) {
          log("error while checking duplicates in search - " + err);
          return callback(false, clean);
        }

        var dupe_count = tracks.length;

        for(var i = 0; i < dupe_count; i++) {
          var dupe = tracks[i].uuid+"",
              indx = streamable.indexOf(dupe);

          if(indx < 0) {
            log("for some reason, ["+dupe+"] was found as a duplicate, but its not in streamable["+streamable.join()+"]");
            continue;
          }

          streamable.splice(indx, 1);
        }
      
        streamable_count = streamable.length;

        // loop over all streamable tracks, fetching their info
        for(var i = 0; i < streamable_count; i++)
          Soundcloud.Track.get({id: streamable[i]}, loadOne);
      }

      Track.find().where({
        uuid: streamable
      }).exec(checkDupes);
    }

    Soundcloud.Track.query({
      q: query
    }, send);
  };

  return Soundcloud;

})();
