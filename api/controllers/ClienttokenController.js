module.exports = (function() {

  var ClientTokenController = {};

  ClientTokenController.destroy = function(req, res, next) {
    var token_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function destroyed(err) {
      return res.status(200).send('');
    }

    function finish(err, token) {
      if(err || !token) {
        sails.log('[ClientTokenController] unable to destroy');
        return res.status(404).send('');
      }

      if(token.user !== user_id) {
        sails.log('[ClientTokenController] unable to destroy - wrong user');
        return res.status(404).send('');
      }

      token.destroy(destroyed);
    }

    if(token_id >= 0) {
      sails.log('[ClientTokenController] attempting to destroy token['+token_id+']');
      Clienttoken.findOne(token_id).exec(finish);
    } else {
      return res.status(404).send('');
    }
  };

  ClientTokenController.find = function(req, res, next) {
    var session_id = req.session.userid,
        user_id = parseInt(session_id, 10),
        valid_user = user_id >= 0;

    if(!valid_user)
      return res.status(404).send('');

    function foundKeys(err, keys) {
      if(err) {
        return res.status(404).send('');
      }

      return res.status(200).json(keys);
    }
    
    Clienttoken.find({user: user_id}).exec(foundKeys);
  };

  ClientTokenController.create = function(req, res, next) {
    var body = req.body,
        client_id = body.client,
        user_id = parseInt(req.session.userid, 10);

    if(!user_id)
      return res.status(404).send('');

    function finish(err, client_token) {
      if(err) {
        sails.log('[ClienttokenController] unable to create client token');
        return res.status(404).send('');
      }

      return res.status(200).json(client_token);
    }

    ClientManagerService.generateClientToken(client_id, user_id, finish);
  };

  return ClientTokenController;

})();
