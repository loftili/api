var Logger = require('../services/Logger'),
    isAdmin = require('../policies/admin');

module.exports = (function() {

  var StreamPermissionController = {},
      log = Logger('StreamPermissionController'),
      transport = sails.config.mail.transport;

  StreamPermissionController.find = function(req, res) {
    var target_stream = parseInt(req.query.stream, 10),
        target_user = parseInt(req.query.user, 10),
        current_user = parseInt(req.session.userid, 10),
        query = {};

    function foundPermissions(err, permissions) {
      if(err) return res.badRequest(err);
      return res.json(permissions);
    }

    function find() {
      return StreamPermission.find(query).exec(foundPermissions);
    }

    if(target_stream > 0) {
      query.stream = target_stream;
      return find();
    }

    if(current_user === target_user) {
      query.user = target_user;
      return find();
    }

    isAdmin.check(current_user, function(is_admin) { is_admin ? find() : res.badRequest(''); });
  };

  StreamPermissionController.create = function(req, res) {
    var current_user = req.session.userid,
        target_user = parseInt(req.body.user, 10),
        target_stream = parseInt(req.body.stream, 10),
        levels = StreamPermissionManager.LEVELS,
        email_html = null,
        created_permission = null;

    function finish() {
      return res.json(created_permission);
    }

    function sendEmail(err, found_user) {
      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: found_user.email,
        subject: '[loftili] new stream permission',
        html: email_html
      }, finish);
    }

    function getUser(err, html) {
      if(err) return res.serverError(err);
      email_html = html;
      User.findOne(target_user).exec(sendEmail);
    }

    function foundStream(err, stream) {
      if(err) return res.serverError(err);
      MailCompiler.compile('stream_permission_grant.jade', {
        stream: stream.title,
        stream_id: stream.id
      }, getUser);
    }

    function created(err, permission) {
      if(err) return res.serverError(err);
      created_permission = permission;
      Stream.findOne(target_stream).exec(foundStream);
    }

    function create(err) {
      if(err) {
        log('unable to create new permission, mask did not check out');
        return res.badRequest(err);
      }

      StreamPermission.findOrCreate({
        stream: target_stream, 
        user: target_user
      }, {
        stream: target_stream, 
        user: target_user,
        level: levels.CONTRIBUTOR
      }).exec(created);
    }

    StreamPermissionManager.is(current_user, target_stream, levels.OWNER, create);
  };

  StreamPermissionController.destroy = function(req, res) {
    var current_user = req.session.userid,
        target_permission = parseInt(req.params.id, 10),
        levels = StreamPermissionManager.LEVELS;

    function destroyed(err) {
      if(err) return res.serverError();
      return res.status(200).send('');
    }

    function destroy(err) {
      if(err) return res.forbidden();
      StreamPermission.destroy({id: target_permission}).exec(destroyed);
    }

    function foundPermission(err, permission) {
      if(err) return res.badRequest(err);
      if(!permission) return res.notFound();
      if(permission.level === levels.OWNER) return res.badRequest('cannot delete owner permission');
      if(permission.user === current_user) return destroy();
      StreamPermissionManager.is(current_user, permission.stream, levels.OWNER, destroy);
    }

    StreamPermission.findOne(target_permission).exec(foundPermission);
  };

  return StreamPermissionController;

})();
