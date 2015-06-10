module.exports = (function() {

  var StreamPermissionManager = {},
      LEVELS = {
        'OWNER': 1,
        'MANAGER': (1 << 1),
        'CONTRIBUTOR': (1 << 1 << 1)
      };

  StreamPermissionManager.is = function(user_id, stream_id, mask, callback) {
    function found(err, permissions) {
      if(err) return callback(err);
      if(permissions.length < 1) return callback('missing');
      var p = permissions[0];
      return mask & p.level ? callback(false, true) : callback(true);
    }
    StreamPermission.find({user: user_id, stream: stream_id}).exec(found);
  };

  StreamPermissionManager.isOwner = function(user_id, stream_id, callback) {
    return StreamPermissionManager.is(user_id, stream_id, LEVELS.OWNER, callback);
  };

  StreamPermissionManager.LEVELS = LEVELS;

  return StreamPermissionManager;

})();
