module.exports = function(req, res, next) {
  var allowed_routes = [
        '/auth',
        '/passwordreset'
      ],
      auth_needed = allowed_routes.indexOf(req.url) < 0,
      headers = req.headers,
      client_key = headers['x-loftili-client-key'],
      user_token = headers['x-loftili-user-token'];

  function sessionAuth() {
    var unauthorized = !req.session.userid && auth_needed;

    if(unauthorized)
      return res.status(401).send('unauthorized user')
    else
      next();
  }

  function finish(err, user) {
    sails.log('[AppAuth] middleware err['+err+'] user['+user+']');

    if(err || !user)
      return res.status(401).send('unauthorized user')
    else {
      req.session.userid = user.id;
      req.session.username = user.username;
      next();
    }
  }

  if(client_key && user_token) {
    ClientManagerService.authenticateUser(client_key, user_token, finish);
  } else {
    sessionAuth();
  }
};
