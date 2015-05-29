module.exports = (function() {

  var AccountRequestController = {};

  AccountRequestController.create = function(req, res) {
    var body = req.body,
        email = body.email,
        has_device = body.has_device || true;

    function created(err, request) {
      if(err) return res.badRequest(err);
      return res.json(request);
    }

    return AccountRequest.create({email: email, has_device: has_device}).exec(created);
  };

  AccountRequestController.destroy = function(req, res) {
    var id = req.params.id;

    function destroyed(err) {
      if(err) return res.serverError(err);
      return res.status(200).send('');
    }

    function found(err, serial) {
      if(err) return res.serverError(err);
      return serial ? serial.destroy(destroyed) : res.notFound();
    }

    return AccountRequest.findOne({id: id}).exec(found);
  };

  AccountRequestController.findOne = function(req, res) {
    var req_id = parseInt(req.params.id, 10);

    function found(err, request) {
      if(err) return res.serverError(err);
      return res.json(request);
    }

    if(req_id >= 0)
      return AccountRequest.findOne(req_id).exec(found);

    return res.badRequest('invalid id');
  };

  AccountRequestController.find = function(req, res) {
    var query = req.query;

    function found(err, requests) {
      if(err) return res.serverError(err);
      return res.json(requests);
    }

    return AccountRequest.find().exec(found);
  };

  return AccountRequestController;

})();
