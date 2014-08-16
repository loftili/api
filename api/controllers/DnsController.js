var namejs = require('namejs'),
    dotenv = require('dotenv');

module.exports = (function() {

  dotenv.load();
	
  var client = new namejs.Client({
        token: process.env['NAMEAPI_TOKEN'],
        username: process.env['NAMEAPI_USER']
      }),
      name_domain = 'lofti.li';

  function registerDomain(user, device, callback) {
    var subdomain = [device.name, user.username].join('.'),
        ip_addr = device.ip_addr;

    function success() {
      sails.log('successfully created: ' + subdomain);
      callback(false, 'ok!');
    }

    function fail(err) {
      sails.log('failed creating: ' + subdomain + ' -> ' + err);
      callback('failed', false);
    }

    sails.log('creating a new subdomain: ' + subdomain + ' -> ' + ip_addr);
    client.createSubdomain(name_domain, subdomain, ip_addr).then(success, fail).fin(success);
  }

  return {

    create: function (req, res, next) {
      if(!req.body.user || !req.body.device)
        return res.status(422).send('');

      var _user = false, 
          _device = false,
          errored = false;

      function fin(err, ok) {
        return err ? res.status(400).send('') : res.status(200).send('');
      }

      function check() {
        if(_user ===  false || _device === false)
          return;
        
        if(errored)
          return res.status(400).send('');

        registerDomain(_user, _device, fin);
      }

      function foundDevice(err, device) {
        if(err)
          errored = true;

        _device = device || true;
        check();
      }

      function foundUser(err, user) {
        if(err)
          errored = true;

        _user = user || true;
        check();
      }

      Device.findOne({id: req.body.device}).exec(foundDevice);
      User.findOne({id: req.body.user}).exec(foundUser);
    }

  };

})();

