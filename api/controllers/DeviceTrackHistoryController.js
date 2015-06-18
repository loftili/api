var Logger = require('../services/Logger');

module.exports = (function() {

  var DeviceHistoryController = {},
      log = Logger('DeviceHistoryController');

  DeviceHistoryController.find = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = parseInt(req.session.userid, 10);

    function foundHistory(err, history) {
      if(err) {
        log('failed getting history: ' + err);
        return res.serverError(err);
      }

      return res.status(200).json(history);
    }

    function hasPermission(has_permission) {
      if(!has_permission) {
        log('failed getting permisions: ' + err);
        return res.status(404).send('');
      }
      DeviceHistory.find({device: device_id}).populate('track').exec(foundHistory);
    }

    if(device_id >= 0 && user_id >= 0) {
      log('looking up device permisions for user['+user_id+'] device['+device_id+']');
      return DevicePermissionManager.validate(device_id, user_id, hasPermission);
    } 

    return res.badRequest('invalid params');
  };

  return DeviceHistoryController;

})();
