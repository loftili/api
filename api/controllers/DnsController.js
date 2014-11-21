var namejs = require('namejs'),
    dotenv = require('dotenv');

module.exports = (function() {

  dotenv.load();

  return {

    create: function (req, res, next) {
      if(!req.body.user || !req.body.device)
        return res.status(422).send('');

      var _user = false, 
          _device = false,
          errored = false;

      function fin(err, ok) {
        if(err)
          return res.status(400).send('');

        var hostname = [_device.name, _user.username].join('.');

        sails.log("[DnsController.create] finished creating dns entry, updating hostname for device");
        return res.status(200).send('');
      }

      function check() {
        if(_user ===  false || _device === false)
          return;
        
        if(errored)
          return res.status(400).send('');

        DnsManagerSerice.createRecord(_user, _device, fin);
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

      if(user_id != req.session.userid)
        return res.status(401).send('');

      if(!user_id || !device_id)
        return res.status(400).send('');

      function fin(err, ok) {
        return (err) ? res.status(400).send('') : res.status(200).send('');
      }

      function check() {
        if(_device === false || _user === false)
          return;

        if(errored)
          return res.status(400).send('');

        DnsManagerSerice.deleteRecord(_user, _device, fin);
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

