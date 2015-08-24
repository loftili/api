var atob = require('atob'),
    Logger = require('../services/Logger'),
    Soundcloud = require('../services/Soundcloud'),
    TrackStreamer = require('../services/TrackStreamer'),
    TrackManagementService = require('../services/TrackManagementService');

module.exports = (function() {

  var TrackController = {},
      log = Logger('TrackController');

  function getFromProvider(provider, uuid, callback) {
    function synced(err, track) {
      return err ? callback('unable to create preview [3]') : callback(false, track);
    }

    function sync() {
      log('syncing track['+uuid+'] from['+provider+']');
      return TrackManagementService.sync(provider, uuid, synced);
    }

    function foundTrack(err, tracks) {
      var match;

      if(err)
        return callback('no matching tracks [0]');

      if(!tracks || tracks.length !== 1)
        return /sc|lftxs/i.test(provider) ? sync() : callback('no matching tracks [1]');

      return callback(false, tracks[0]);
    }

    Track.find().where({
      or: [{
        pid: uuid,
        provider: (provider+'').toUpperCase()
      }, {
        uuid: uuid,
        provider: (provider+'').toUpperCase()
      }, {
        id: uuid,
        provider: (provider+'').toUpperCase()
      }]
    }).exec(foundTrack);

  }

  TrackController.findOne = function(req, res) {
    var id = req.params.id;

    function found(err, track) {
      if(err) return res.serverError(err);
      return track ? res.json(track) : res.notFound();
    }

    Track.findOne(id).exec(found);
  };


  TrackController.sync = function(req, res) {
    var query = req.query,
        provider = query.provider,
        uuid = query.uuid;

    if(!provider || !uuid)
      return res.badRequest('must provide the provider and uuid of the track');

    function finish(err, track) {
      return err ? res.badRequest(err) : res.json(track);
    }

    getFromProvider(provider, uuid, finish);
  };


  TrackController.preview = function(req, res) {
    var params = req.params,
        id = parseInt(params.id);

    if(isNaN(id) || id <= 0)
      return res.badRequest('must provide the provider and uuid of the track');

    function preview(err, track) {
      return (err || !track) ? res.badRequest(err) : TrackStreamer.pipe(track, res);
    }

    Track.findOne(id, preview);
  };

  TrackController.find = function(req, res, next) {
    var user_id = req.session.userid,
        query = req.query.q;

    if(!query) return res.badRequest('missing query (q) parameter');

    function finish(err, tracks) {
      if(err) {
        log('errored getting track list: ' + err);
        return res.status(404).send('');
      }

      return res.status(200).json(tracks);
    }

    TrackManagementService.search(query, finish);
  };

  TrackController.upload = function(req, res) {
    var user = req.session.userid;

    function uploaded(err, created_track) {
      if(err) {
        log('FAILED uploading track: ' + err);
        return res.status(422).send({error: 'FILE_ERROR', summary: 'could not properly upload file to temporary space'});
      }

      return res.status(201).json(created_track);
    }

    function callback(err, files) {
      if (err)
        return res.status(500).send({error: 'FILE_ERROR', summary: 'unable to handle reques\'s file information'});

      if(files.length < 1)
        return res.status(400).send({error: 'NO_FILE', summary: 'no file attatched to request'});

      return TrackManagementService.upload(files[0], uploaded);
    }

    req.file('file').upload(callback);
  };

  TrackController.update = function(req, res) {
    var track_id = req.params.id,
        track_title = req.body.title;

    function updated(err, track) {
      if(err)
        return res.status(422).send('');

      return res.json(track);
    }

    function found(err, track) {
      if(err || !track)
        return res.status(404).send('');

      track.title = track_title;
      track.save(updated);
    }

    Track.findOne({id: track_id}).exec(found);
  };

  return TrackController;
	
})();

