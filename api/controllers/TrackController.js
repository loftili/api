var atob = require('atob');

module.exports = {

  search: function(req, res) {
    var query = req.query,
        track_query = query ? (query.q||'').toLowerCase() : false;

    if(!track_query)
      return res.status(404).send('not found');

    function callback(err, tracks) {
      if(err) {
        sails.log('[TrackController][search] SQL error:');
        sails.log(err);
        return res.status(500).send('');
      }

      var matching = [];
      for(var i = 0; i < tracks.length; i++) {
        var track = tracks[i],
            t_title = track.track_title,
            a_name = track.artist_name,
            t_id = track.track_id,
            artist_match = a_name && (a_name.toLowerCase().indexOf(track_query) >= 0),
            track_match = t_title && (t_title.toLowerCase().indexOf(track_query) >= 0);

        if(artist_match || track_match)
          matching.push({id: t_id, title: t_title, artist: {name: a_name}});
      }
      
      return res.status(200).json(matching);
    }

    var selections = 't.id as track_id, t.title as track_title, a.id as artist_id, a.name as artist_name',
        join = 'left join artist as a on t.artist = a.id',
        sql_query = ['select', selections, 'from track as t', join].join(' ');

    Track.query(sql_query, callback);
  },

  scout: function(req, res) {
    var query = req.query,
        url = query && query.url ? query.url : false;

    function finish(err, found_track) {
      if(err) {
        sails.log('[TrackController][scout] Error scouting: ['+err+']');
        return res.status(404).send('');
      }

      return res.status(200).json(found_track)
    }

    if(url) {
      var decoded = false;

      try {
        decoded = atob(url);
      } catch(e) {
        sails.log('[TrackController][scout] Error decoding query url: ' + e);
        return res.status(422).send('');
      }
      TrackManagementService.scout(decoded, finish);
    } else
      return res.status(404).send('');
  },

  upload: function(req, res) {
    var user = req.session.userid;

    function finish(err, track) {
      if(err) {
        sails.log('[TrackController][upload][finish] FAILED adding user to track list: ' + err);
        return res.status(422).send({error: 'UPLOAD_FAIL', summary: err});
      }

      sails.log('[TrackController][upload][finish] finished uploading everything');
      return res.status(201).json(track);
    }

    function uploaded(err, created_track) {
      if(err) {
        sails.log('[TrackController][upload][uploaded] FAILED uploading track: ' + err);
        return res.status(422).send({error: 'FILE_ERROR', summary: 'could not properly upload file to temporary space'});
      }

      sails.log('[TrackController][upload][uploaded] uploaded track, associating user: ' + user);
      created_track.users.add(user);
      created_track.save(finish);
    }

    function callback(err, files) {
      if (err)
        return res.status(500).send({error: 'FILE_ERROR', summary: 'unable to handle reques\'s file information'});

      if(files.length < 1)
        return res.status(400).send({error: 'NO_FILE', summary: 'no file attatched to request'});

      return TrackManagementService.upload(files[0], uploaded);
    }

    req.file('file').upload(callback);
  },

  update: function(req, res) {
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
  },

  missing: function(req, res) {
    res.status(404).send('not found');
  }
	
};

