var fs = require('fs'),
    path = require('path'),
    id3 = require('id3js'),
    jsftp = require('jsftp'),
    uuid = require('node-uuid');

module.exports = (function() {

  var TrackManagementService = {},
      type_test = /audio\/(mp3)/,
      name_test = /^.*\/(\S+)\.\w+$/,
      ftp = new jsftp({
        host: process.env['STORAGE_HOST'],
        user: process.env['STORAGE_USER'],
        pass: process.env['STORAGE_PASS'],
        debugMode: true
      }),
      tracks_home = process.env['STORAGE_ROOT'],
      found_artist = null;

  function upload(file, callback) {
    var track_info = {
          uuid: uuid.v4()
        };

    function logall(type, data) {
      if(data && data.text && data.code)
        sails.log('[TrackManagementService][DEBUG]['+data.code+']: ' + data.text.replace(/\n/g, ''));
    }

    function finished(err, created) {
      if(err) {
        sails.log('[TrackManagementService][upload] unable to create a new track row: ' + err);
        return callback(err, false);
      }

      sails.log('[TrackManagementService][upload] created a new track row successfully');
      created.artist = found_artist;
      callback(false, created);
    }

    function associate(err, artist) {
      if(err) {
        sails.log('[TrackManagementService][upload] unable to associate track with an artist: ' + err);
        return callback(err, false);
      }

      if(artist) {
        track_info.artist = artist.id;
        found_artist = artist;
      }

      sails.log('[TrackManagementService][upload] finsihed finding association for track');
      Track.create(track_info).exec(finished);
    }

    function tagged(err, tags) {
      if(err) {
        sails.log('[TrackManagementService][upload] failed loading mp3 tags: ' + err);
        return callback(err, false);
      }

      track_info.name = tags.title;
      track_info.year = tags.year;
      track_info.type = file.type;
      sails.log('[TrackManagementService][upload] successfully loaded mp3 tags, finding artist and creating track');
      Artist.findOrCreate({'name': tags.artist}, {name: tags.artist}, associate);
    }

    function uploaded(err) {
      if(err) {
        sails.log('[TrackManagementService][upload] failed uploading to ftp server: ' + err);
        callback(err, false);
      }
      
      sails.log('[TrackManagementService][upload] track was uploaded to ftp server successfully, saving to db');

      id3({file: file.fd, type: id3.OPEN_LOCAL}, tagged);
    }

    function read(err, data) {
      if(err)
        return callback(err, false);

      var path = [tracks_home, track_info.uuid].join('/');

      sails.log('[TrackManagementService][upload] file was successfully read, sending via ftp');
      sails.log('[TrackManagementService][upload] path['+path+'] uuid['+track_info.uuid+']');
      ftp.on('jsftp_debug', logall);
      ftp.put(data, path, uploaded);
    }

    sails.log('[TrackManagementService][upload] reading file fd['+file.fd+']');
    fs.readFile(file.fd, read);
  }

  function isValid(file) {
    return file && type_test.test(file.type) && name_test.test(file.fd);
  }

  TrackManagementService.upload = function(file, callback) {
    if(!file.fd)
      return callback('file missing descriptor', false);
    
    return isValid(file) ? upload(file, callback) : callback('invalid file', false);
  }

  return TrackManagementService;

})();
