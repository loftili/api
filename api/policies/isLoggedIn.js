var Logger = require('../services/Logger');

module.exports = function(req, res, next) {
  var allowed_routes = [
        '/auth',
        '/passwordreset'
      ],
      log = Logger('isLoggedIn'),
      auth_needed = allowed_routes.indexOf(req.url) < 0,
      headers = req.headers,
      client_key = headers['x-loftili-client-key'],
      user_token = headers['x-loftili-user-token'];

  function sessionAuth() {
    var unauthorized = !req.session.userid && auth_needed;

    if(unauthorized)
      return res.status(401).send('unauthorized user [session]')

    next();
  }

  function finish(err, user) {
    if(err || !user) {
      log('unable to authenticate based on client info['+client_key+'] token['+user_token+'] err['+err+']');
      return res.status(401).send('unauthorized user [client]')
    }

    sails.log('[AppAuth] middleware err['+err+'] user['+user.id+']');
    req.session.userid = user.id;
    req.session.username = user.username;
    next();
  }

  if(client_key && user_token)
    return ClientManagerService.authenticateUser(client_key, user_token, finish);

  sessionAuth();
};
