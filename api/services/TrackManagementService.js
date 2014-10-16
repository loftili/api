var fs = require('fs'),
    path = require('path'),
    id3 = require('id3js'),
    jsftp = require('jsftp'),
    uuid = require('node-uuid'),
    http = require('http');

module.exports = (function() {

  var TrackManagementService = {},
      type_test = /audio\/(mp3)/,
      name_test = /^.*\/(\S+)\.\w+$/,
      tracks_home = process.env['STORAGE_ROOT'],
      found_artist = null;

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

      sails.log('[TrackManagementService][scout] completely finished scouting, cleaning up track file from local');
      fs.unlinkSync(file_path);
      return callback(false, track);
    }

    function tagged(err, tags) {
      if(err) {
        sails.log('[TrackManagementService][scout] invalid mp3 files found on the track: '+err);
        return callback('invalid mp3 data', false);
      }

      upload(file_path, finish);
    }

    function written(err) {
      if(err) {
        sails.log('[TrackManagementService][scout] scout data could not be written to file: '+err);
        return callback('unable to write scout data to file ['+err+']', false);
      }

      sails.log('[TrackManagementService][scout] finished downloading and writing, checking tags.');
      id3({file: file_path, type: id3.OPEN_LOCAL}, tagged);
    }

    function received() {
      temp_uuid = uuid.v4();
      file_path = ['/tmp', temp_uuid].join('/');
      fs.writeFile(file_path, track_data, written);
    }

    function found(res) {
      sails.log('[TrackManagementService][scout] succeeded scouting url['+url+']');
      res.on('data', load);
      res.on('end', received);
    }

    function errored() {
      sails.log('[TrackManagementService][scout] FAILED scouting url['+url+']');
      callback('failed connecting with scouting party', false);
    }

    sails.log('[TrackManagementService][scout] scouting url['+url+']');
    http.get(url, found).on('error', errored);
  }

  function upload(local_file_path, callback) {
    var track_info = {
          uuid: uuid.v4()
        },
        ftp = getftp();

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
      if(err)
        return callback(err, false);

      track_info.title = tags.title;
      track_info.year = tags.year;
      track_info.type = 'audio/mp3';
      sails.log('[TrackManagementService][upload] successfully loaded mp3 tags: ['+JSON.stringify(tags)+']');

      if(tags.artist)
        Artist.findOrCreate({'name': tags.artist}, {name: tags.artist}, associate);
      else
        Track.create(track_info).exec(finished);
    }

    function uploaded(err) {
      if(err) {
        sails.log('[TrackManagementService][upload] failed uploading to ftp server: ' + err);
        callback(err, false);
      }

      ftp.destroy();
      sails.log('[TrackManagementService][upload] track was uploaded to ftp server successfully, checking tags');
      id3({file: local_file_path, type: id3.OPEN_LOCAL}, tagged);
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

    sails.log('[TrackManagementService][upload] reading file fd['+local_file_path+']');
    fs.readFile(local_file_path, read);
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
