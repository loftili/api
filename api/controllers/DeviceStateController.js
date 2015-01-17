module.exports = (function() {

  var DeviceStateController = {};


  DeviceStateController.findOne = function(req, res, next) {
  };

  DeviceStateController.update = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        query_dict = req.query,
        auth_header = req.headers['x-loftili-device-auth'],
        auth_query_token = query_dict && query_dict.device_token ? query_dict.device_token : false,
        auth_key = auth_query_token || auth_header,
        state_info = req.body;

    if(!auth_key) {
      sails.log('[DeviceStateController][update] unauthorized attempt to update device state');
      return res.status(401).send('');
    }
    
    function finish(err) {
      if(err) {
        sails.log('[DeviceStateController][update] errored during DeviceStateService');
        return res.status(404).send('');
      }

      return res.status(200).send('');
    }

    function foundDevice(err, device) {
      if(err || !device) {
        sails.log('[DeviceStateController][update] errored or unable to find device - err['+err+']');
        return res.status(401).send('');
      }

      if(!state_info) {
        sails.log('[DeviceStateController][update] invalid state');
        return res.status(422).send('invalid state');
      }

      sails.log('[DeviceStateController][update] updating device['+device_id+'] to state['+JSON.stringify(state_info)+']');
      DeviceStateService.update(device_id, state_info, finish);
    }

    Device.findOne({token: auth_key}).exec(foundDevice);
  };

  return DeviceStateController;

})();
