module.exports = (function() {

  var ClientController =  {};

  ClientController.create = function(req, res, next) {
    var body = req.body,
        name = body ? body.name : false;

    if(!name)
      return res.status(404).send('missing');

    function finish(err, client) {
      if(err) {
        sails.log('[ClientController] unable to create client - error['+err+']');
        return res.status(404).send('');
      }

      return res.status(200).json(client);
    }

    function makeClient() {
      ClientManagerService.createClient(name, finish);
    }

    function foundClient(err, client) {
      if(client.length > 0)
        return res.status(406).send('taken');

      return makeClient();
    }

    sails.log('[ClientController] checking presence of existing client['+name+']');
    Client.find({name: name}).exec(foundClient);
  };

  return ClientController;

})();
