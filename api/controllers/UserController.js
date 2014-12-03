module.exports = {

  create: function(req, res, next) {
    function finished(err, user) {
      if(err) {
        sails.log('[UserController][create] failed creating a user: '+err);
        return res.status(422).json(err);
      }

      return res.status(201).json(user);
    }

    sails.log('[UserController][create] attempting to create a user from request body: '+JSON.stringify(req.body));
    User.create(req.body, finished);
  },

  update: function(req, res) {
    var user_id = parseInt(req.params.id, 10),
        session_user = parseInt(req.session.userid, 10);

    function finished(err, user) {
      if(err) {
        sails.log('[UserController][update] updating user failed err['+err+']');
        return res.status(422).send(err);
      }

      return res.status(202).send(user);
    }

    function update(user) {
      for(var name in req.body) {
        if(req.body.hasOwnProperty(name) && User.writable.indexOf(name) >= 0)
          user[name] = req.body[name];
      }
      user.save(finished);
    }

    function found(err, user) {
      if(err) {
        sails.log('[UserController][tracks] FAILED lookup: ' + err);
        return res.status(404).send('');
      }

      update(user);
    }

    if(user_id !== session_user)
      return res.status(404).send('');

    sails.log('[UserController][update] updating user['+user_id+'] session['+session_user+']');
    User.findOne(user_id).exec(found);
  },

  addTrack: function(req, res) {
    var user_id = parseInt(req.params.id, 10),
        session_user = parseInt(req.session.userid, 10),
        track_id = req.body && req.body.track ? parseInt(req.body.track, 10) : false;

    if(user_id !== session_user || !(track_id >= 0))
      return res.status(404).send('');

    function finish(err, done) {
      if(err) {
        sails.log('[UserController][addTrack] failed adding track['+track_id+'] err['+err+']');
        return res.status(404).send('');
      }
      return res.json(done);
    }

    function found(err, user) {
      if(err) {
        sails.log('[UserController][addTrack] unable to find the user sent via put...');
        return res.status(404).send('');
      }
      user.tracks.add(track_id);
      user.save(finish);
    }

    User.findOne(user_id).exec(found);
  },

  tracks: function(req, res) {
    var user_id = parseInt(req.params.id, 10),
        session_user = parseInt(req.session.userid, 10);

    function found(err, user) {
      if(err) {
        sails.log('[UserController][tracks] FAILED lookup: ' + err);
        return res.status(404).send('');
      }

      return res.status(200).json(user.tracks);
    }

    if(user_id !== session_user)
      return res.status(404).send('');

    sails.log('[UserController][tracks] Looking up tracks for user['+user_id+'] session['+session_user+']');
    User.findOne({id: user_id}).populate('tracks').exec(found);
  },

  search: function(req, res) {
    var query = req.query,
        user_query = query && query.q ? (query.q+'').toLowerCase() : false;

    if(!user_query)
      return res.status(404).send('Not found');

    function callback(err, users) {
      if(err) {
        sails.log('[UserController][search] SQL error:');
        sails.log(err);
        return res.status(500).send('');
      }

      var matching = [],
          index = [],
          user, username;

      for(var index = 0; index < users.length; index++) {
        user = users[index];
        username = user.username.toLowerCase();

        if(username.indexOf(user_query) > -1)
          matching.push(user);
      }

      return matching.length > 0 ? res.status(200).json(matching) : res.status(404).send('');
    }

    User.query('SELECT id, username FROM user WHERE privacy_level < 5', callback);
  },

  passwordReset: function(req, res, next) {
    var user = req.body.user;

    if(!user)
      return res.status(400).send('');

    function finish(err, user) {
      if(err)
        return res.status(400).send(err);

      return res.status(200).json(user);
    }

    PasswordResetService.reset(user, finish);
  }
	
};

