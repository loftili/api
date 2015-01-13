module.exports = (function() {

  var ClientTokenController = {};

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
    
    Clienttoken.findWhere({user: user_id}).exec(foundKeys);
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
