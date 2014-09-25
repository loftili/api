module.exports = {

  upload: function(req, res) {
    var user = req.session.userid;

    function finish(err, track) {
      if(err)
        return res.status(422).send(err);

      sails.log('[TrackController][upload][finish] finished uploading everything');
      return res.status(201).json(track);
    }

    function uploaded(err, created_track) {
      if(err)
        return res.status(422).send(err);

      sails.log('[TrackController][upload][uploaded] uploaded track, associating user: ' + user);
      created_track.users.add(user);
      created_track.save(finish);
    }

    function callback(err, files) {
      if (err)
        return res.status(500).send(err);

      if(files.length < 1)
        return res.status(400).send('no uploaded track');

      return TrackManagementService.upload(files[0], uploaded);
    }

    req.file('file').upload(callback);
  },

  missing: function(req, res) {
    res.status(404).send('not found');
  }
	
};

