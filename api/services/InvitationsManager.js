var crypto = require('crypto'),
    jade = require('jade'),
    path = require('path');

module.exports = (function() {

  var InvitationsManager = {},
      transport = sails.config.mail.transport;

  InvitationsManager.send = function(options, callback) {
    var from = options.from,
        to = options.to,
        created_invite;

    function sent(err, info) {
      sails.log("[PasswordResetService] Sent callback | err[" + err + "] info[" + info.response + "]");
      if(err) {
        return callback(err, null);
      } else {
        return callback(null, created_invite);
      }
    }

    function created(err, invite) {
      if(err) { 
        sails.log('[InvitationsManager][send] unable to create or find the record based on params');
        return callback(err, null);
      }

      var template_path = path.join(__dirname, '..', '..', 'views', 'email', 'invite.jade'),
          template_fn = jade.compileFile(template_path, {}),
          email_html = template_fn({token: invite.token}),

      created_invite = invite;

      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: to,
        subject: 'invitation to loftili',
        html: email_html
      }, sent);
    }

    function generated(err, buffer) {
      var token = buffer.toString('hex').substring(0, 10),
          params = {
            from: from,
            to: to,
            token: token
          };

      Invitation.findOrCreate({from: from, to: to}, params, created);
    }

    crypto.randomBytes(30, generated);
  };

  return InvitationsManager;

})();
