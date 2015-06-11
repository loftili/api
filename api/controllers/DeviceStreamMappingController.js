var isAdmin = require('../policies/admin');

module.exports = (function() {

  var DeviceStreamMappingController = {};

  DeviceStreamMappingController.find = function(req, res) {
    var stream = parseInt(req.query.stream, 10);

    function found(err, mappings) {
      return res.json(mappings);
    }

    function adminCheck(is_admin) {
      return is_admin ? DeviceStreamMapping.find().exec(found) : res.badRequest();
    }

    if(stream > 0)
      return DeviceStreamMapping.find({stream: stream}).populate('device').exec(found);

    return isAdmin.check(req.session.userid, adminCheck);
  };

  return DeviceStreamMappingController;

})();
