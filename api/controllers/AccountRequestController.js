var Logger = require('../services/Logger');

module.exports = (function() {

  var AccountRequestController = {},
      transport = sails.config.mail.transport,
      log = Logger('AccountRequestController');

  AccountRequestController.create = function(req, res) {
    var body = req.body,
        email = body.email,
        has_device = body.has_device || true,
        created_request = null;

    function finish(err) {
      return res.json(created_request);
    }

    function sendEmail(err, html) {
      transport.sendMail({
        from: 'no-reply@loftili.com',
        to: 'support@loftili.com',
        subject: '[loftili] new account request',
        html: html
      }, finish);
    }

    function created(err, request) {
      if(err) return res.badRequest(err);
      created_request = request;

      MailCompiler.compile('account_request.jade', {
        email: email
      }, sendEmail);
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
