module.exports = function userUpdatePermission(req, res, next) {
  var session_user = req.session ? parseInt(req.session.userid, 10) : false,
      session_role = req.session ? req.session.role : false,
      reset_token = req.body ? req.body.reset_token : false,
      new_password = req.body ? req.body.password : false;

  sails.log('[userUpdatePermission] updating user information for: ' + req.params.id);

  if(session_user && session_user == req.params.id) {
    sails.log('[userUpdatePermission] user is logged in, continuing');
    return next();
  }

  if(session_user && session_role > 1) {
    sails.log('[userUpdatePermission] user doing update is sudoed in, continuing');
    return next();
  }

  function finished(err, user) {
    if(err)
      return res.status(400).send('couldnt finish');

    sails.log('[userUpdatePermission] user password reset finished successfully');
    return res.status(200).json(user);
  }

  if(reset_token && new_password)
    PasswordResetService.finish(reset_token, new_password, finished);
  else
    return res.status(404).send('not found');
};
