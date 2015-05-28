var Logger = require('../services/Logger'),
    DeviceAuthentication = require('../services/DeviceAuthentication');

module.exports = (function() {

  var DeviceStateController = {},
      log = Logger('DeviceStateController');

  DeviceStateController.findOne = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function foundState(err, device_state) {
      if(err) {
        log(err);
        return res.badRequest(err);
      }

      return res.status(200).send(device_state);
    }

    function foundDevice(err, device) {
      if(err) {
        log(err);
        return res.badRequest();
      }

      if(!device) {
        log('unable to find device');
        return res.notFound();
      }

      var permissions = device.permissions,
          p_count = permissions.length,
          can_check = false;

      for(var i = 0; i < p_count; i++) {
        var p = permissions[i];
        if(p.user == user_id) {
          can_check = true;
        }
      }

      if(can_check)
        return DeviceStateService.find(device_id, foundState);

      log('user has no right');
      return res.notFound();
    }

    Device.findOne(device_id).populate('permissions').exec(foundDevice);
  };

  DeviceStateController.update = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        auth_info = DeviceAuthentication.parseRequest(req),
        state_info = req.body;

    if(!auth_info) {
      log('attempt made to update device state without any auth info');
      return res.forbidden();
    }
 
    if(!state_info)
      return res.badRequest('no state data');
   
    function finish(err) {
      if(err) {
        log(err);
        return res.notFound();
      }


      log('update success');
      DeviceSockets.users.broadcast(device_id, 'DEVICE_STATE');
      return res.status(200).send('');
    }

    function foundDevice(err, device) {
      if(err || !device) {
        log('errored or unable to find device - err['+err+']');
        return res.forbidden();
      }

      log('updating device['+device_id+'] to state['+JSON.stringify(state_info)+']');
      DeviceStateService.update(device_id, state_info, finish);
    }

    Device.findOne({token: auth_info.token}).exec(foundDevice);
  };

  return DeviceStateController;

})();
