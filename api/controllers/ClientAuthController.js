module.exports = (function() {

  var ClientAuthController = {};

  ClientAuthController.authenticate = function(req, res, next) {
    var body = req.body,
        email = body ? body.email : false,
        password = body ? body.password : false,
        client_key = body ? body.client : false,
        resolved = {},
        sent = false;

    if(!email || !password || !client_key) {
      return res.status(404).send('');
    }

    function finish(err, client_auth) {
      if(err) {
        sails.log('[ClientAuthController] problem during service - error['+err+']');
        return res.status(404).send('');
      }

      return res.status(200).json(client_auth);
    }

    function createClientAuth() {
      var client_id = resolved['client'].id,
          user_id = resolved['user'].id;

      ClientManagerService.createClientAuth(client_id, user_id, finish);
    }

    function resolve(property) {
      var callback;

      callback = function(err, value) {
        if(err || !value) {
          sails.log('[ClientAuthController] failed authenticating - ['+property+']');
          if(sent) return;
          sent = true;
          return res.status(404).send('');
        }

        resolved[property] = value;

        if(resolved['client'] && resolved['user'] && resolved['token'])
          createClientAuth();
      }

      return callback;
    }

    sails.log('[ClientAuthController] attempting to auth user['+email+'] to client['+client_key+'] using['+password+']');
    User.findOne({email: email}).exec(resolve('user'));
    Client.findOne({consumer_key: client_key}).exec(resolve('client'));
    Clienttoken.findOne({token: password}).exec(resolve('token'));
  };

  return ClientAuthController;

})();
