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

    function sentEmail(err, info) {
      sails.log("[InvitationsManager][send] Sent callback | err[" + err + "] info[" + info.response + "]");

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
          email_html = template_fn({token: invite.token});

      sails.log('[InvitationsManager][send] successfully created invite ['+invite+']');

      created_invite = invite;

      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: to,
        subject: 'invitation to loftili',
        html: email_html
      }, sentEmail);
    }

    function generated(err, buffer) {
      var token = buffer.toString('hex').substring(0, 10),
          params = {
            from: from,
            to: to,
            token: token
          };

      function alreadyExists(err, invitation) {
        if(err) { 
          sails.log('[InvitationsManager][send] unable to create or find the record based on params');
          return callback(err, null);
        }

        if(invitation.length > 0)
          return callback(null, invitation);
        else
          Invitation.findOrCreate(params, params, created);
      }

      Invitation.find({from: from, to: to}, alreadyExists);
    }

    crypto.randomBytes(30, generated);
  };

  return InvitationsManager;

})();
