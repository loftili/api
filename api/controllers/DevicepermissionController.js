module.exports = (function() {

  var DevicePermissionController = {};

  DevicePermissionController.destroy = function(req, res) {
    var session_user = parseInt(req.session.userid, 10),
        permission_id = parseInt(req.params.id, 10),
        found_permission = null;

    function finish(err, deleted) {
      if(err) {
        sails.log('[DevicepermissionController][destroy] unable to destroy [' + err + ']');
        return res.status(404).send('');
      }

      return res.status(200).send('');
    }

    function check(err, current_permission) {
      if(err || !current_permission || current_permission.length < 1) {
        sails.log('[DevicepermissionController][destroy] unable to find owner permission based on current owner [' + err + ']');
        return res.status(404).send('');
      }

      sails.log('[DevicepermissionController][destroy] found the permission with current user: [' + current_permission[0].level + ']');

      if(current_permission[0].level !== DeviceShareService.LEVELS.DEVICE_OWNER)
        res.status(404).send('');
      else
        Devicepermission.destroy({id: permission_id}, finish);
    }

    function found(err, permission) {
      if(err) {
        sails.log('[DevicepermissionController][destroy] could not delete record: ' + err);
        return res.status(404).send('');
      }

      found_permission = permission;
      sails.log('[DevicepermissionController][destroy] found a valid permission based on param, checking permission to delete');
      Devicepermission.find({user: session_user}).exec(check);
    }

    Devicepermission.findOne(permission_id, found);
  };

  DevicePermissionController.find = function(req, res) {
    var session_user = req.session.userid,
        device_query = req.query.device,
        user_query = req.query.user,
        where_clause = { };

    function found(err, permissions) {
      if(err)
        return res.status(404).send(err);

      return res.status(200).json(permissions);
    }

    if(device_query)
      where_clause.device = device_query;

    if(user_query)
      where_clause.user = user_query;

    if(!where_clause.user && !where_clause.device)
      return res.status(404).send('missing parameters');

    Devicepermission.find(where_clause).populate('user').populate('device').exec(found);
  };


  DevicePermissionController.create = function(req, res) {
    var device_id = req.body.device,
        user_id = req.body.user,
        level = parseInt(req.body.level, 10),
        owner = req.session.userid,
        params = {
          device: device_id,
          sharer: owner,
          level: level,
          target: user_id
        };

    function finish(err, record) {
      return err ? res.status(404).send(err) : res.status(202).json(record);
    }

    function populate(record) {
      Devicepermission.findOne(record.id).populate('user').exec(finish);
    }

    function added(err, record) {
      return err ? res.status(404).send(err) : populate(record);
    }

    if(!level) {
      return res.status(422).send('');
    } else {
      DeviceShareService.share(params, added);
    }
  };

  return DevicePermissionController;

})();
