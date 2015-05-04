module.exports = (function() {

  var UserController = {};

  function to_s(str) { return ['', str].join(''); }
  function lower(str) { return to_s(str).toLowerCase(); }

  UserController.create = function(req, res, next) {
    var token = req.body.token,
        found_invite = null,
        created_user = null;

    function finish() {
      return res.status(201).json(created_user);
    }

    function madeUser(err, user) {
      if(err) {
        sails.log('[UserController][create] failed creating a user: '+err);
        return res.status(422).json(err);
      }


      sails.log('[UserController][create] createdUser finished, user['+user.id+']');

      created_user = user;

      UserInvitation.create({invitation: found_invite.id, user: user.id}, finish);
    }

    function foundToken(err, invites) {
      var invite = invites ? invites[0] : false,
          is_invited = invite && lower(invite.to) === lower(req.body.email);

      if(err) {
        sails.log('[UserController][create] errored while looking for invitation');
        return res.status(404).send('');
      }

      if(!invite || !is_invited) {
        sails.log('[UserController][create] attempt without token - req.email['+req.body.email+'] invite['+invite+']');
        return res.status(401).send('missing token');
      }

      if(invite.users.length > 0) {
        sails.log('[UserController][create] token already used');
        return res.status(401).send('already used');
      }

      sails.log('[UserController][create] matched token to attempt, creating');

      found_invite = invite;

      User.findOrCreate({email: req.body.email}, req.body, madeUser);
    }

    var info = {
      email: req.body.email,
      password: lower(req.body.password).replace(/.*/gi, '*'),
      username: req.body.username,
      token: req.body.token
    };
    sails.log('[UserController][create] attempting to create a user from request body: '+JSON.stringify(info));
    Invitation.find({token: token}).populate('users').exec(foundToken);
  };

  UserController.update = function(req, res) {
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
      var updating_password = false,
          body = req.body;

      for(var name in body) {
        var can_write = User.writable.indexOf(name) >= 0,
            can_update = body.hasOwnProperty(name) && can_write;

        if(can_update) {
          user[name] = req.body[name];

          if(name == 'password')
            updating_password = true;
        }
      }

      function save() {
        user.save(finished);
      }

      if(updating_password)
        HashService(user, 'password', save);
      else
        save();
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
  };

  UserController.addTrack = function(req, res) {
    var user_id = parseInt(req.params.id, 10),
        session_user = parseInt(req.session.userid, 10),
        track_id = req.body && req.body.track ? parseInt(req.body.track, 10) : false;

    if(user_id !== session_user || !(track_id >= 0))
      return res.status(404).send('');

    function foundTrack(err, track) {
      if(err) {
        sails.log('[UserController][addTrack] failed finding track after add');
        return res.status(404).send('');
      }

      return res.status(200).json(track);
    }

    function finish(err, done) {
      if(err) {
        sails.log('[UserController][addTrack] failed adding track['+track_id+'] err['+err+']');
        return res.status(404).send('');
      }

      Track.findOne(track_id).exec(foundTrack);
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
  };

  UserController.tracks = function(req, res) {
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
  };

  UserController.search = function(req, res) {
    var query = req.query,
        user_query = query && query.q ? (query.q+'').toLowerCase() : false,
        current_user = req.session.userid;

    if(!current_user) return res.forbidden();

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

        if(username.indexOf(user_query) > -1 && user.id !== current_user)
          matching.push(user);
      }

      return matching.length > 0 ? res.status(200).json(matching) : res.status(404).send('');
    }

    User.query('SELECT id, username FROM user WHERE privacy_level < 5 OR privacy_level IS NULL', callback);
  };

  UserController.passwordReset = function(req, res, next) {
    var user = req.body.user;

    if(!user)
      return res.status(400).send('');

    function finish(err, user) {
      if(err)
        return res.status(400).send(err);

      return res.status(200).json(user);
    }

    PasswordResetService.reset(user, finish);
  };

  UserController.dropTrack = function(req, res, next) {
    var user_id = parseInt(req.params.id, 10),
        track_id = parseInt(req.params.track_id, 10),
        session_user = req.session.userid;

    if(user_id !== session_user || !(track_id >= 0)) {
      return res.status(404).send('nope');
    }

    function finish(err, other) {
      if(err) {
        return res.status(404).send('');
      }

      return res.status(204).send('');
    }

    function found(err, user) {
      if(err) {
        return res.status(404).send('');
      }

      user.tracks.remove(track_id);
      user.save(finish);
    }

    sails.log('[UserController][dropTrack] Looking up tracks for user['+user_id+'] session['+session_user+']');
    User.findOne({id: user_id}).populate('tracks').exec(found);
  };

  return UserController;
	
})();

