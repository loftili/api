var net = require('net');

module.exports = {

  ping: function(req, res, next) {
    var sock = new net.Socket(),
        device_id = req.params.id,
        user_id = req.session.user,
        username = req.session.username,
        device_hostname, device_port,
        ping_status = false;

    if(!user_id)
      return res.status(401).send('');

    if(!device_id)
      return res.status(400).send('');

    function foundDevice(err, device) {
      if(err)
        return res.status(404).send('');

      function finished(err, saved_device) {
        sock.destroy();

        if(err)
          return res.status(400).send('');

        return res.status(ping_status === 'success' ? 200 : 404).json({ping: ping_status, device: saved_device});
      }

      function connected() {
        sails.log('[device.ping:success] Socket succeeded pinging ' + device_hostname + ':' + device_port);
        ping_status = 'success';
        device.status = true;
        device.save(finished);
      }

      function fail(type) {
        return function(e) {
          sails.log('[device.ping:fail] Socket failed when pinging ' + device_hostname + ':' + device_port + ' -> ' + type);
          ping_status = e;
          device.status = false;
          device.save(finished);
        }
      }

      device_hostname = [device.name, username, 'lofti.li'].join('.');
      device_port = device.port || 80;

      sails.log('[device.ping] Attempting to ping: ' + device_hostname + ' on port: ' + device_port);
      sock.setTimeout(10000);

      sock.on('connect', connected)
          .on('error', fail('error'))
          .on('timeout', fail('timeout'))
          .connect(device_port, device_hostname);
    }

    Device.findOne({id: device_id}).populate('permissions').exec(foundDevice);
  }

};

