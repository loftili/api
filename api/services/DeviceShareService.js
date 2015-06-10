var Logger = require('./Logger');

module.exports = (function() {

  var DeviceShareService = { },
      LEVELS = {
        DEVICE_OWNER: 1,
        DEVICE_FRIEND: (1 << 1)
      },
      log = Logger('DeviceShareService');

  DeviceShareService.LEVELS = LEVELS;

  DeviceShareService.share = function(params, cb) {
    var device_id = parseInt(params.device, 10),
        target_user = parseInt(params.target, 10),
        level = parseInt(params.level, 10),
        is_forced = params.force === true,
        sharer = params.sharer,
        params = {
          device: device_id,
          user: target_user,
          level: level
        };

    function finish(err, created) {
      if(err) {
        log('totally failed creating device permission');
        log(err);
      }

      cb(err, created);
    }

    function foundOwner(err, record) {
      if(err) {
        log('failed very hard, ' + err);
        return cb(err);
      }

      if(!record) {
        log('unable to find a valid ownership based on that which was requested');
        return cb('not the owner');
      }

      log('found the valid owner during share, good to go, creating ' + JSON.stringify(params));
      Devicepermission.findOrCreate(params, params, finish);
    }

    if(is_forced) {
      log('forcing level ' + level);
      log('forcing share of device, ' + JSON.stringify(params));
      Devicepermission.findOrCreate(params, params, finish);
    } else {
      var ownership_params = {
            user: sharer,
            level: LEVELS.DEVICE_OWNER
          };

      log('looking up ownership of device, ' + JSON.stringify(ownership_params));
      Devicepermission.find(ownership_params, foundOwner);
    }
  };

  return DeviceShareService;

})();
