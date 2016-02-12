var Logger = require("../services/Logger");

module.exports = (function() {

  var DeviceHistoryController = {},
      log = Logger("DeviceHistoryController");

  DeviceHistoryController.find = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = parseInt(req.session.userid, 10);

    function foundHistory(err, history) {
      var tracks = [];

      if(err) {
        log("failed getting history: " + err);
        return res.serverError(err);
      }

      var c = history.length;
      for(var i = 0; i < c; i++) {
        var h = history[i].toJSON(),
            t = h.track;

        if(!t) continue;

        h.track = t.id;
        tracks.push(h);
      }

      return res.status(200).json(tracks);
    }

    function hasPermission(has_permission, err) {
      if(!has_permission) {
        log("failed getting permisions: " + err);
        return res.status(404).send("");
      }

      DeviceHistory.find({
        where: {
          device: device_id
        },
        sort: "createdAt DESC",
        limit: 20
      }).populate("track").exec(foundHistory);
    }

    if(device_id >= 0 && user_id >= 0) {
      log("looking up device permisions for user["+user_id+"] device["+device_id+"]");
      return DevicePermissionManager.validate(device_id, user_id, hasPermission);
    } 

    return res.badRequest("invalid params");
  };

  return DeviceHistoryController;

})();
