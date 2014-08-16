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
    client.createSubdomain(name_domain, subdomain, ip_addr).then(success, fail);
  }

  function deleteSubdomain(user, device, callback) {
    var subdomain = [device.name, user.username].join('.');

    function success() {
      sails.log('successfully deleted: ' + subdomain);
      callback(false, 'ok!');
    }

    function fail(err) {
      sails.log('failed deleting: ' + subdomain + ' -> ' + err);
      callback('failed', false);
    }

    sails.log('deleting a subdomain: ' + subdomain);
    client.deleteSubdomain(name_domain, subdomain).then(success, fail);
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
    },

    destroy: function(req, res, next) {
      var device_id = req.query.device,
          user_id = req.query.user,
          _device = false, _user = false,
          errored = false;

      if(user_id != req.session.user)
        return res.status(401).send('');

      if(!user_id || !device_id)
        return res.status(400).send('');

      function fin(err, ok) {
         return err ? res.status(400).send('') : res.status(200).send('');
      }

      function check() {
        if(_device === false || _user === false)
          return;

        if(errored)
          return res.status(400).send('');

        deleteSubdomain(_user, _device, fin);
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

      Device.findOne({id: device_id}).exec(foundDevice);
      User.findOne({id: user_id}).exec(foundUser);
    }

  };

})();

