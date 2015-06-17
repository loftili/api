var fs = require('fs'),
    path = require('path'),
    id3 = require('id3js'),
    jsftp = require('jsftp'),
    uuid = require('node-uuid'),
    http = require('http'),
    Logger = require('./Logger'),
    request = require('request');

module.exports = (function() {

  var TrackManagementService = {},
      type_test = /audio\/(mp3)/,
      name_test = /^.*\/(\S+)\.\w+$/,
      tracks_home = process.env['STORAGE_ROOT'],
      found_artist = null,
      log = Logger('TrackManagementService');

  function getftp() {
    ftp = new jsftp({
      host: process.env['STORAGE_HOST'],
      user: process.env['STORAGE_USER'],
      pass: process.env['STORAGE_PASS'],
      debugMode: true
    });
    return ftp;
  }

  function scout(url, callback) {
    var track_data = '',
        file_path;

    function load(data) {
      track_data += data;
    }

    function finish(err, track) {
      if(err)
        return callback(err, false)

      log('completely finished scouting, cleaning up track file from local');
      fs.unlinkSync(file_path);
      return callback(false, track);
    }

    function tagged(err, tags) {
      if(err) {
        log('invalid mp3 files found on the track: '+err);
        return callback('invalid mp3 data', false);
      }

      if(!tags.title) {
        log('invalid scout');
        return callback('missing track title', false);
      }

      upload(file_path, finish);
    }

    function written(err) {
      if(err) {
        log('scout data could not be written to file: '+err);
        return callback('unable to write scout data to file ['+err+']', false);
      }

      log('finished downloading and writing, checking tags.');
      id3({file: file_path, type: id3.OPEN_LOCAL}, tagged);
    }

    function received(err, response, body) {
      if(err) {
        log('failed scouting: ' + err);
        return callback(err);
      }

      written();
    }

    var temp_uuid = uuid.v4();
    file_path = ['/tmp', temp_uuid].join('/');
    log('scout starting, saving to: ' + file_path);
    request.get(url, received).pipe(fs.createWriteStream(file_path));
  }

  function upload(local_file_path, callback) {
    var track_info = {
          uuid: uuid.v4()
        },
        ftp = getftp(),
        created_track = null;

    function logall(type, data) {
      if(data && data.text && data.code)
        log('['+data.code+']: ' + data.text.replace(/\n/g, ''));
    }

    function uploaded(err) {
      if(err) {
        log('failed uploading to ftp server: ' + err);
        callback(err, false);
      }

      ftp.destroy();
      callback(false, created_track);
    }

    function read(err, data) {
      if(err)
        return callback(err, false);

      var path = [tracks_home, track_info.uuid].join('/');

      log('file was successfully read, uploading to path['+path+'] uuid['+track_info.uuid+']');
      ftp.on('jsftp_debug', logall);
      ftp.put(data, path, uploaded);
    }

    function finished(err, created) {
      if(err) {
        log('unable to create a new track row: ' + err);
        return callback(err, false);
      }

      created_track = created;
      fs.readFile(local_file_path, read);
    }

    function foundTrack(err, track) {
      if(err) callback(err, false);

      if(track.length) {
        log('[TRACK DUPE] already have a track by name of ['+track_info.title+'] in the database, skipping upload');
        return callback(false, track[0]);
      }

      Track.create(track_info).exec(finished);
    }

    function tagged(err, tags) {
      if(err) return callback(err, false);

      if(!tags.artist || !tags.title) {
        log('invalid tags - missing track artist or track title');
        return callback('no artist', false);
      }

      track_info.title = tags.title.replace(/\0/ig, '');
      track_info.year = tags.year;
      track_info.type = 'audio/mp3';

      function madeArtist(err, artist) {
        log('created new artist['+artist.name+'] id['+artist.id+']');
        track_info.artist = artist;
        Track.create(track_info).exec(finished);
      }

      function foundArtist(err, artists) {
        if(err) return callback(err, false);

        if(artists.length != 1) {
          return Artist.create({name: cleaned_artist_name}).exec(madeArtist);
        }

        log('found existing artist - ['+artists[0].name+'] ['+artists[0].id+'], checking for existing track by name of ['+track_info.title+']');
        track_info.artist = artists[0];
        Track.find({title: track_info.title, artist: artists[0].id}).exec(foundTrack);
      }

      cleaned_artist_name = tags.artist.replace(/\0/ig, '');
      log('[TRACK TAG] successfully loaded mp3 tags... title[' +track_info.title+ '] artist['+(tags.artist || '').replace(/\0/ig, '')+'] - checking for existing artist');
      return Artist.find({name: cleaned_artist_name}).exec(foundArtist);
    }

    id3({file: local_file_path, type: id3.OPEN_LOCAL}, tagged);
  }

  function isValid(file) {
    return file && type_test.test(file.type) && name_test.test(file.fd);
  }

  TrackManagementService.scout = function(url, callback) {
    var has_protocol = url.match(/(https?\:\/\/)?(.*)/),
        full_url = has_protocol ? [has_protocol[1] ? has_protocol[1] : "http://", has_protocol[2]].join('') : false;

    return full_url ? scout(full_url, callback) : callback('invalid url', false);
  }

  TrackManagementService.upload = function(file, callback) {
    if(!file.fd)
      return callback('file missing descriptor', false);
    
    return isValid(file) ? upload(file.fd, callback) : callback('invalid file', false);
  }

  return TrackManagementService;

})();
