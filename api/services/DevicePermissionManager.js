var Logger = require('./Logger');

module.exports = (function() {

  var DevicePermissionManager = { },
      LEVELS = {
        DEVICE_OWNER: 1,
        DEVICE_FRIEND: (1 << 1)
      },
      log = Logger('DevicePermissionManager');

  DevicePermissionManager.LEVELS = LEVELS;

  DevicePermissionManager.validate = function(device, user, cb) {
    function foundPermissions(err, permissions) {
      if(err) { 
        log('failed looking up device permissions for state patch: '+err);
        return callback(false);
      }

      if(permissions.length <= 0) return cb(false);

      // checking device permission level
      var level = permissions[0].level,
          mask = LEVELS.DEVICE_FRIEND | LEVELS.DEVICE_OWNER;

      // invalid device permission level
      if(!(mask & level)) return cb(false);
          
      return cb(true);
    }

    log('SELECT FROM devicepermission WHERE user = '+user+' AND device = '+device+';');
    Devicepermission.find({user: user, device: device}).exec(foundPermissions);
  }

  DevicePermissionManager.grant = function(params, cb) {
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

  return DevicePermissionManager;

})();
