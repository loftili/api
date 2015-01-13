module.exports = (function() {

  var ClienttokenController = {};

  ClienttokenController.create = function(req, res, next) {
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

  return ClienttokenController;

})();
