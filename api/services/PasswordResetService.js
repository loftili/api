var btoa = require('btoa'),
    jade = require('jade'),
    path = require('path'),
    crypto = require('crypto'),
    Logger = require('../services/Logger');

module.exports = (function() {

  var PasswordResetService = {},
      transport = sails.config.mail.transport,
      log = Logger('PasswordResetService');

  function makeToken(user) {
    var date = new Date(new Date().getTime() + (60 * 60 * 1000)).toISOString(),
        joined = [date, user.username].join(':'),
        token = btoa(joined);

    log("Created token for " + user.username + " date[" + date + "]");
    return token;
  }

  PasswordResetService.finish = function(reset_token, new_password, callback) {
    var found_user = null;

    function saved(err, user) {
      if(err)
        return callback(err, false);
      
      log("completely finished updating user");
      return callback(false, user);
    }

    function doSave() {
      found_user.save(saved);
    }

    function found(err, user) {
      if(err)
        return callback(err, false);

      if(!user)
        return callback('missing', false);

      found_user = user;
      found_user.password = new_password;
      found_user.reset_token = null;

      log("user found, proceeding to update of model");
      HashService(found_user, 'password', doSave);
    }

    log("attempting to finish password reset based on: " + reset_token);
    User.findOne({reset_token: reset_token}).exec(found);
  };

  PasswordResetService.reset = function(user_id, callback) {
    var found_user = null,
        is_email = /^\S+@\S+\.\S+$/.test(user_id),
        is_id = parseInt(user_id, 10) > 0;

    function sent(err, info) {
      log("Sent callback | err[" + err + "]");
      callback(err, found_user);
    }

    function sendMail(err, html) {
      if(err) {
        return callback(err, null);
      }

      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: found_user.email,
        subject: '[loftili] your password reset',
        html: html
      }, sent);
    }

    function compileEmail(err, user) {
      if(err) {
        return callback(err, false);
      }

      found_user = user;

      MailCompiler.compile('reset_password.jade', {token: user.reset_token}, sendMail);
    }

    function generated(err, buffer) {
      if(err) {
        log('failed generating random token err['+err+']');
        return callback('failed token gen', null);
      }

      var token = buffer.toString('hex').substring(0, 20);

      found_user.reset_token = token;
      found_user.save(compileEmail);
    }
      
    function foundUser(err, user) {
      if(err)
        return callback(err, false);

      if(!user)
        return callback('missing', false);

      found_user = user;

      crypto.randomBytes(30, generated);
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
