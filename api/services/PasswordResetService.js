var btoa = require('btoa'),
    jade = require('jade'),
    path = require('path');

module.exports = (function() {

  var PasswordResetService = {},
      transport = sails.config.mail.transport;

  function makeToken(user) {
    var date = new Date(new Date().getTime() + (60 * 60 * 1000)).toISOString(),
        joined = [date, user.username].join(':'),
        token = btoa(joined);

    sails.log("[PasswordResetService] Created token for " + user.username + " date[" + date + "]");
    return token;
  }

  PasswordResetService.finish = function(reset_token, new_password, callback) {
    var found_user = null;

    function saved(err, user) {
      if(err)
        return callback(err, false);
      
      sails.log("[PasswordResetService][finish] completely finished updating user");
      return callback(false, user);
    }

    function found(err, user) {
      if(err)
        return callback(err, false);

      if(!user)
        return callback('missing', false);

      sails.log("[PasswordResetService][finish] user found, proceeding to update of model");
      user.password = new_password;
      user.reset_token = null;
      user.save(saved);
    }

    sails.log("[PasswordResetService][finish] attempting to finish password reset based on: " + reset_token);
    User.findOne({reset_token: reset_token}).exec(found);
  };

  PasswordResetService.reset = function(user_id, callback) {
    var found_user = null,
        is_email = /^\S+@\S+\.\S+$/.test(user_id),
        is_id = parseInt(user_id, 10) > 0;

    function sent(err, info) {
      sails.log("[PasswordResetService] Sent callback | err[" + err + "] info[" + info.response + "]");
      callback(err, found_user);
    }

    function finish(err, user) {
      if(err)
        return callback(err, false);

      sails.log("[PasswordResetService] Sending mail using nodemailer");
      found_user = user;

      var template_path = path.join(__dirname, '..', '..', 'views', 'email', 'reset_password.jade'),
          template_fn = jade.compileFile(template_path, {}),
          email_html = template_fn({token: user.reset_token});

      sails.log("[PasswordResetService] template path: " + template_path);

      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: user.email,
        subject: '[loftili] your password reset',
        html: email_html
      }, sent);
    }
      
    function foundUser(err, user) {
      if(err)
        return callback(err, false);

      if(!user)
        return callback('missing', false);

      user.reset_token = makeToken(user);
      user.save(finish);
    }

    if(is_email) 
      User.findOne({email: user_id}).exec(foundUser);
    else if(is_id)
      User.findOne(user_id).exec(foundUser);
    else
      callback('invalid', false)
  }

  return PasswordResetService;

})();
