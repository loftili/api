var Logger = require("../services/Logger");

module.exports = (function() {

  var DevicePermissionController = {},
      log = Logger("DevicePermissionController");

  DevicePermissionController.destroy = function(req, res) {
    var session_user = parseInt(req.session.userid, 10),
        permission_id = parseInt(req.params.id, 10),
        found_permission = null;

    function finish(err, deleted) {
      if(err) {
        log("unable to destroy [" + err + "]");
        return res.status(404).send("");
      }

      return res.status(200).send("");
    }

    function check(err, current_permission) {
      if(err || !current_permission || current_permission.length < 1) {
        log("unable to find owner permission based on current owner [" + err + "]");
        return res.status(404).send("");
      }

      log("found the permission with current user: [" + current_permission[0].level + "]");
      if(current_permission[0].level !== DevicePermissionManager.LEVELS.DEVICE_OWNER) return  res.notFound();
      DevicePermission.destroy({id: permission_id}, finish);
    }

    function found(err, permission) {
      if(err) {
        log("could not delete record: " + err);
        return res.status(404).send("");
      }

      found_permission = permission;
      log("found a valid permission based on param, checking permission to delete");
      DevicePermission.find({user: session_user}).exec(check);
    }

    DevicePermission.findOne(permission_id, found);
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
      return res.status(404).send("missing parameters");

    DevicePermission.find(where_clause).exec(found);
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
      if(err) {
        log("unable to add ["+user_id+"] as an owner of ["+device_id+"]:" + err);
        return res.badRequest();
      }

      return res.status(202).json(record);
    }

    function populate(record) {
      DevicePermission.findOne(record.id).populate("user").exec(finish);
    }

    function added(err, record) {
      return err ? res.notFound() : populate(record);
    }

    if(!level) return res.badRequest("missing permission level");
    DevicePermissionManager.grant(params, added);
  };

  return DevicePermissionController;

})();
