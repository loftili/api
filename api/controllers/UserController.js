var isAdmin = require('../policies/admin'),
    Logger = require('../services/Logger');

module.exports = (function() {

  var UserController = {},
      transport = sails.config.mail.transport,
      log = Logger('UserController');

  function to_s(str) { return ['', str].join(''); }
  function lower(str) { return to_s(str).toLowerCase(); }

  UserController.create = function(req, res, next) {
    var token = req.body.token,
        found_invite = null,
        created_user = null;

    function respond() {
      return res.status(201).json(created_user);
    }

    function sendEmail(err, html) {
      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: process.env['SUPPORT_EMAIL'] || 'support@loftili.com',
        subject: '[loftili] new account',
        html: html
      }, respond);
    }

    function finish() {
      MailCompiler.compile('new_user.jade', {
        username: created_user.username,
        email: created_user.email
      }, sendEmail);
    }

    function madeUser(err, user) {
      if(err) {
        log('failed creating a user: '+err);
        return res.status(422).json(err);
      }


      log('createdUser finished, user['+user.id+']');
      created_user = user;

      if(req.body.token)
        return UserInvitation.create({invitation: found_invite.id, user: user.id}, finish);

      return finish();
    }

    function foundUser(err, users) {
      if(err) {
        log('failed looking up users during create ['+err+']');
        return res.badRequest();
      }

      log('duplicate user check returned ['+users.length+'] users');

      if(users.length) return res.badRequest('duplicate');

      User.create(req.body).exec(madeUser);
    }

    function foundToken(err, invites) {
      var invite = invites ? invites[0] : false,
          is_invited = invite && lower(invite.to) === lower(req.body.email);

      if(err) {
        log('errored while looking for invitation');
        return res.serverError(err);
      }

      if(!invite || !is_invited) {
        log('attempt without token - req.email['+req.body.email+'] invite['+invite+']');
        return res.forbidden();
      }

      if(invite.users.length > 0) {
        log('token already used');
        return res.forbidden();
      }

      found_invite = invite;

      User.find().where({
        or: [{
          email: req.body.email,
          username: req.body.username
        }]
      }).exec(foundUser);
    }

    var info = {
      email: req.body.email,
      password: lower(req.body.password).replace(/.*/gi, '*'),
      username: req.body.username
    };

    if(req.body.token)
      return Invitation.find({token: token}).populate('users').exec(foundToken);

    log('creating user without a token ['+req.body.email+'] and ['+req.body.username+']');
    User.find().where({
      or: [{
        email: req.body.email
      }, {
        username: req.body.username
      }]
    }).exec(foundUser);
  };

  UserController.findOne = function(req, res) {
    var current_user = req.session.userid,
        target_user = parseInt(req.params.id, 10),
        is_admin = false;

    if(!(target_user > 0)) return res.badRequest('invalid user id');

    function found(err, user) {
      if(err) {
        return res.serverError(err);
      }

      if(!user) return res.notFound();

      var json = user.toJSON(),
          result = {};

      if(is_admin) return res.json(user);

      for(var prop in json) {
        if(User.public_read.indexOf(prop) >= 0) result[prop] = json[prop];
      }

      return res.json(result);
    }

    function checkedAdmin(ia) {
      is_admin = ia;
      return User.findOne({id: target_user}).exec(found);
    }

    return isAdmin.check(current_user, checkedAdmin);
  };

  UserController.update = function(req, res) {
    var user_id = parseInt(req.params.id, 10),
        session_user = parseInt(req.session.userid, 10);

    function finished(err, user) {
      if(err) {
        log('updating user failed err['+err+']');
        return res.badRequest(err);
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
        return HashService(user, 'password', save);

      save();
    }

    function found(err, user) {
      if(err) {
        log('FAILED lookup: ' + err);
        return res.status(404).send('');
      }

      update(user);
    }

    if(user_id !== session_user)
      return res.status(404).send('');

    log('updating user['+user_id+'] session['+session_user+']');
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
        log('failed finding track after add');
        return res.status(404).send('');
      }

      return res.status(200).json(track);
    }

    function finish(err, done) {
      if(err) {
        log('failed adding track['+track_id+'] err['+err+']');
        return res.status(404).send('');
      }

      Track.findOne(track_id).exec(foundTrack);
    }

    function found(err, user) {
      if(err) {
        log('unable to find the user sent via put...');
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
        log('FAILED lookup: ' + err);
        return res.status(404).send('');
      }

      return res.status(200).json(user.tracks);
    }

    if(user_id !== session_user)
      return res.status(404).send('');

    log('Looking up tracks for user['+user_id+'] session['+session_user+']');
    User.findOne({id: user_id}).populate('tracks').exec(found);
  };

  UserController.find = function(req, res) {
    var query = req.query,
        user_query = query && query.q ? (query.q+'').toLowerCase() : false,
        current_user = req.session.userid,
        admin_flag = query && query.admin;

    if(!current_user) return res.forbidden();

    if(!user_query)
      return res.notFound('missing query');

    function callback(err, users) {
      if(err) return res.serverError(err);
      return res.json(users);
    }

    function adminCheck(is_admin) {
      return is_admin ? UserSearch.admin(user_query, callback) : UserSearch.visible(user_query, callback);
    }

    return admin_flag ? isAdmin.check(req.session.userid, adminCheck) 
      : UserSearch.visible(user_query, callback);
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

    log('Looking up tracks for user['+user_id+'] session['+session_user+']');
    User.findOne({id: user_id}).populate('tracks').exec(found);
  };

  return UserController;
	
})();

