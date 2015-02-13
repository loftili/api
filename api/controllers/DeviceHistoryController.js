module.exports = (function() {

  var DeviceHistoryController = {};

  function log(msg) {
    var d = new Date();
    sails.log('[DeviceHistoryController]['+d+'] ' + msg);
  }

  DeviceHistoryController.find = function(req, res, next) {
    var device_id = parseInt(req.query.device, 10),
        user_id = parseInt(req.session.userid, 10);

    function foundHistory(err, history) {
      if(err) {
        log('failed getting history: ' + err);
        return res.status(404).send('');
      }

      return res.status(200).json(history);
    }

    function foundPermission(err, permisions) {
      if(err) {
        log('failed getting permisions: ' + err);
        return res.status(404).send('');
      }

      var has_permissions = permisions && permisions.length > 0;

      if(!has_permissions) {
        log('current user has no permission to browse history');
        return res.status(422).send('');
      }

      log('permisions check out, getting history records');
      DeviceHistory.find({device: device_id}).populate('track').exec(foundHistory);
    }

    function find() {
      Devicepermission.find({user: user_id, device: device_id}).exec(foundPermission);
    }

    if(device_id >= 0 && user_id >= 0) {
      log('looking up device permisions for user['+user_id+'] device['+device_id+']');
      find();
    } else if(!user_id)
      return res.status(401).send('cannot get history');
    else
      return res.status(404).send('missing device param');
  };

  return DeviceHistoryController;

})();
