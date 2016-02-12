var fs = require("fs"),
    path = require("path"),
    id3 = require("id3js"),
    jsftp = require("jsftp"),
    uuid = require("node-uuid"),
    http = require("http"),
    Logger = require("./Logger"),
    Soundcloud = require("./Soundcloud"),
    Lftxs = require("./Lftxs"),
    request = require("request");

module.exports = (function() {

  var TrackManagementService = {},
      type_test = /audio\/mp3|mpeg/i,
      name_test = /^.*\/(\S+)\.\w+$/,
      tracks_home = process.env["STORAGE_ROOT"],
      found_artist = null,
      log = Logger("TrackManagementService");

  function getftp() {
    ftp = new jsftp({
      host: process.env["STORAGE_HOST"],
      user: process.env["STORAGE_USER"],
      pass: process.env["STORAGE_PASS"],
      debugMode: true
    });
    return ftp;
  }

  function upload(local_file_path, callback) {
    var track_info = {
          uuid: uuid.v4(),
          provider: "LF"
        },
        ftp = getftp(),
        created_track = null;

    function logall(type, data) {
      if(data && data.text && data.code)
        log("["+data.code+"]: " + data.text.replace(/\n/g, ""));
    }

    function uploaded(err) {
      if(err) {
        log("failed uploading to ftp server: " + err);
        callback(err, false);
      }

      ftp.destroy();
      callback(false, created_track);
    }

    function read(err, data) {
      if(err)
        return callback(err, false);

      var path = [tracks_home, track_info.uuid].join("/");

      log("file was successfully read, uploading to path["+path+"] uuid["+track_info.uuid+"]");
      ftp.on("jsftp_debug", logall);
      ftp.put(data, path, uploaded);
    }

    function finished(err, created) {
      if(err) {
        log("unable to create a new track row: " + err);
        return callback(err, false);
      }

      created_track = created;
      fs.readFile(local_file_path, read);
    }

    function foundTrack(err, track) {
      if(err) callback(err, false);

      if(track.length) {
        log("[TRACK DUPE] already have a track by name of ["+track_info.title+"] in the database, skipping upload");
        return callback(false, track[0]);
      }

      Track.create(track_info).exec(finished);
    }

    function tagged(err, tags) {
      if(err) return callback(err, false);

      if(!tags.artist || !tags.title) {
        log("invalid tags - missing track artist or track title");
        return callback("no artist", false);
      }

      track_info.title = tags.title.replace(/\0/ig, "");
      track_info.year = tags.year;
      track_info.type = "audio/mp3";

      function madeArtist(err, artist) {
        log("created new artist["+artist.name+"] id["+artist.id+"]");
        track_info.artist = artist;
        Track.create(track_info).exec(finished);
      }

      function foundArtist(err, artists) {
        if(err) return callback(err, false);

        if(artists.length != 1) {
          return Artist.create({name: cleaned_artist_name}).exec(madeArtist);
        }

        log(["found existing artist - ["+artists[0].name+"] ["+artists[0].id+"]",
             "checking for existing track by name of ["+track_info.title+"]"].join(", "));
        track_info.artist = artists[0];
        Track.find({title: track_info.title, artist: artists[0].id}).exec(foundTrack);
      }

      cleaned_artist_name = (tags.artist || "").replace(/\0/ig, "");
      log("[TRACK TAG] title[" +track_info.title+ "] artist["+cleaned_artist_name+"]");
      return Artist.find({name: cleaned_artist_name}).exec(foundArtist);
    }

    id3({file: local_file_path, type: id3.OPEN_LOCAL}, tagged);
  }

  function isValid(file) {
    return file && type_test.test(file.type) && name_test.test(file.fd);
  }

  TrackManagementService.search = function(query, callback) {
    var found = false,
        results = [],
        errored = false,
        finished = 0;

    function finish() {
      var ids = [],
          clean = [],
          c = results.length,
          soundlcoud_results = null,
          lftxs_results = null,
          responded = false;

      for(var i = 0; i < c; i++) {
        var t = results[i];
        if(ids.indexOf(t.id) >= 0) continue;
        clean.push(t);
        ids.push(t.id);
      }

      function respond() {
        var complete_set = clean.concat(
          (soundlcoud_results || []), 
          (lftxs_results || [])
        );
        return responded ? false : callback(false, complete_set);
      }

      function addSoundcloud(err, soundcloud_tracks) {
        if(err)
          log("failed searching soundcloud");

        soundlcoud_results = err ? false : soundcloud_tracks;
        if(lftxs_results !== null) respond();
      }

      function addLftxs(err, info) {
        if(err)
          log("failed searching lftxs ["+err.messge+"]");

        lftxs_results = err ? false : info;
        if(soundlcoud_results !== null) respond();
      }

      Soundcloud.search(query, addSoundcloud);
      Lftxs.search(query, addLftxs);
    }

    function queriedTracks(err, r) {
      if(err) {
        errored = err;
        return callback(err);
      }

      results = results.concat(r);

      if(++finished === 2 && !errored)
        return finish();
    }

    function queriedArtists(err, r) {
      if(err) {
        errored = err;
        return callback(err);
      }

      var l = 0,
          c = r.length;

      for(l; l < c; l++) {
        var a = r[l];
        results = results.concat(a.tracks);
      }

      if(++finished === 2 && !errored)
        return finish();
    }

    Track.find({title: {contains: query}}).exec(queriedTracks);
    Artist.find({name: {contains: query}}).populate("tracks").exec(queriedArtists);
  };

  TrackManagementService.upload = function(file, callback) {
    if(!file.fd)
      return callback("file missing descriptor", false);
    
    return isValid(file) ? upload(file.fd, callback) : callback("invalid file [pre-test]", false);
  };

  TrackManagementService.sync = function(provider, pid, callback) {
    var created_track;

    function created(err, track) {
      log("finished creating track from["+provider+"] - ["+track.id+"]");
      return callback(err, track);
    }

    function foundSoundcloud(err, response) {
      var b, p, e;

      try {
        b = JSON.parse(response.body);
      } catch(e) {
        b = false;
      }

      if(!b)
        return callback("unable to translate soundcloud track");

      p = Soundcloud.Track.translate(b);

      if(!p) {
        log("soundcloud body was not able to translate to track["+response.body+"]");
        return callback("unable to translate soundcloud track");
      }

      delete p["id"];
      p.uuid = pid;
      Track.create(p, created);
    }

    if(/sc/i.test(provider)) {
      log("syncing from soundcloud!");
      return Soundcloud.Track.get({id: pid}, foundSoundcloud);
    }

    if(/lftxs/i.test(provider))
      return Lftxs.register(pid, callback);

    return callback("unknown provider");
  };

  return TrackManagementService;

})();
