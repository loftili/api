var Logger = require('../services/Logger');

module.exports = (function() {

  var StreamController = {},
      log = Logger('StreamController');

  StreamController.move = function(req, res) {
    var user = parseInt(req.session.userid, 10),
        from = parseInt(req.body.from, 10),
        to = parseInt(req.body.to, 10),
        stream_id = parseInt(req.params.id, 10),
        OWNER = StreamPermissionManager.LEVELS.OWNER,
        CONTRIBUTOR = StreamPermissionManager.LEVELS.CONTRIBUTOR,
        mask = OWNER | CONTRIBUTOR;

    function canMove(err, can_move) {
      if(err) {
        log('unable to move tracks around user['+user+'] stream['+stream_id+']');
        return res.forbidden();
      }

      function moved(err, new_queue) {
        if(err) {
          log('errored moving: ' + err);
          return res.badRequest(err);
        }

        return res.json(new_queue);
      }

      return StreamManager.move(stream_id, from, to, moved);
    }

    return StreamPermissionManager.is(user, stream_id, mask, canMove);
  };

  StreamController.dequeue = function(req, res) {
    var user = parseInt(req.session.userid),
        stream = req.params.id,
        position = parseInt(req.params.position, 10),
        levels = StreamPermissionManager.LEVELS,
        found_stream = null;

    function finish(err, stream_list) {
      if(err) { 
        log(err)
        return res.badRequest(err);
      }

      var js = found_stream.toJSON();
      js.queue = stream_list.queue;
      return res.json(js);
    }

    function foundStream(err, stream) {
      if(err) return res.serverError(err);
      if(!stream) return res.notFound();
      found_stream = stream;

      // the stream is open to contibuting
      if(stream.privacy === 0)
        return StreamManager.remove(stream.id, position, finish);

      var permissions = stream.permissions,
          count = permissions.length;

      for(var i = 0; i < count; i++) {
        var p = permissions[i];
        if(p.user === user) return StreamManager.remove(stream.id, position, finish);
      }

      return res.notFound();
    }

    Stream.findOne(stream).populate('permissions').exec(foundStream);
  };

  StreamController.enqueue = function(req, res) {
    var track_id = req.body.track,
        provider = req.body.provider,
        provider_id = req.body.pid,
        user = parseInt(req.session.userid),
        needs_sync = /SC|LFTXS/i.test(provider) && track_id < 0 && provider_id,
        stream = req.params.id,
        levels = StreamPermissionManager.LEVELS,
        found_stream = null;

    function finished(err, stream_queue) {
      var js = found_stream.toJSON();
      js.queue = stream_queue ? stream_queue.queue : [];
      return res.json(js);
    }

    function foundTrack(err, track) {
      if(err) return res.serverError(err);
      if(!track) return res.notFound();
      StreamManager.enqueue(stream, track.id, finished);
    }

    function foundStream(err, stream) {
      if(err) return res.serverError(err);
      if(!stream) return res.notFound();
      found_stream = stream;

      // the stream is open to contibuting
      if(stream.privacy === 0)
        return Track.findOne(track_id).exec(foundTrack);

      var permissions = stream.permissions,
          count = permissions.length;

      for(var i = 0; i < count; i++) {
        var p = permissions[i];

        if(p.user === user)
          return Track.findOne(track_id).exec(foundTrack);
      }

      return res.forbidden();
    }

    function attempt(err, track) {
      if(err) return res.badRequest('unable to queue[0]');
      track_id = track.id;
      Stream.findOne(stream).populate('permissions').exec(foundStream);
    }


    if(needs_sync) {
      log('attempting to enqueue track needing sync');
      return TrackManagementService.sync(provider, provider_id, attempt);
    }

    Stream.findOne(stream).populate('permissions').exec(foundStream);
  };

  StreamController.find = function(req, res) {
    var current_user = parseInt(req.session.userid),
        query = req.query.q;

    function found(err, streams) {
      if(err) return res.serverError(err);
      var c = streams.length,
          r = [];

      for(var i = 0; i < c; i++) {
        var s = streams[i],
            p = s.permissions;

        if(s.privacy === 0) {
          r.push(s);
          continue;
        }

        for(var j = 0; j < p.length; j++) {
          if(p[j].user === current_user) r.push(s);
        }
      }

      return res.json(r);
    }

    if(!query) 
      return Stream.find().populate('permissions').exec(found)

    Stream.find({
      or: [{
        title: { 'contains': query }
      }, {
        description: { 'contains': query }
      }]
    }).populate('permissions').exec(found);
  };

  StreamController.create = function(req, res) {
    var title = req.body.title,
        description = req.body.description,
        privacy = parseInt(req.body.privacy, 10),
        created_stream = false;

    if(!title || !description) return res.badRequest();

    function mapped(err, permission) {
      if(err) return res.serverError(err);
      return res.json(created_stream);
    }

    function created(err, stream) {
      if(err) return res.serverError(err);
      created_stream = stream;
      StreamPermission.create({
        user: req.session.userid, 
        level: StreamPermissionManager.LEVELS.OWNER, 
        stream: stream.id
      }).exec(mapped);
    }

    return Stream.create({
      title: title, 
      description: description,
      privacy: privacy >= 1 ? privacy : 0
    }).exec(created);
  };

  StreamController.destroy = function(req, res) {
    var user_id = parseInt(req.session.userid, 10),
        stream_id = parseInt(req.params.id, 10);

    function destroyed(err) {
      if(err) return res.serverError(err);
      return res.status(200).send('');
    }

    function foundPermission(err) {
      if(err) return res.badRequest(err);
      Stream.destroy({id: stream_id}, destroyed);
    }

    StreamPermissionManager.isOwner(user_id, stream_id, foundPermission);
  };

  StreamController.update = function(req, res) {
    var id = parseInt(req.params.id, 10);

    function finished(err, stream) {
      if(err) {
        log('failed updating - ' + err);
        return res.serverError(err);
      }

      return res.status(202).json(stream);
    }

    function found(err, stream) {
      if(err) return res.serverError(err);
      if(!stream) return res.notFound();
      var changed = false;

      log('updating stream: ['+JSON.stringify(req.body)+']');
      for(var i = 0; i < Stream.writable.length; i++) {
        var a = Stream.writable[i];
        if(req.body[a] === undefined) continue;
        stream[a] = req.body[a];
        changed = true;
      }

      if(changed)
        stream.save(finished);
      else
        return res.status(204).send('');
    }

    return Stream.findOne(id).exec(found);
  };

  StreamController.findOne = function(req, res) {
    var id = parseInt(req.params.id, 10),
        current_user = parseInt(req.session.userid, 10),
        found_stream = null;

    function foundListing(err, listing) {
      var js = found_stream.toJSON();
      js.queue = listing ? listing.queue : [];
      return res.json(js);
    }

    function found(err, stream) {
      if(err) return res.serverError(err);
      if(!stream) return res.notFound();
      found_stream = stream;


      if(stream.privacy === 0) {
        return StreamManager.find(id, foundListing);
      }

      var p = stream.permissions;
      for(var i = 0; i < p.length; i++) {
        if(p[i].user == current_user) return StreamManager.find(id, foundListing);
      }

      return res.notFound();
    }

    return Stream.findOne(id).populate('permissions').exec(found);
  };

  return StreamController;

})();
