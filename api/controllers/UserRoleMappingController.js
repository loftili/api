module.exports = (function() {

  var UserRoleMappingController = {};

  UserRoleMappingController.find = function(req, res) {
    var user_id = parseInt(req.session.userid, 10);

    if(!(user_id > 0)) return res.forbidden();

    function found(err, mappings) {
      if(err) return res.badRequest(err);
      return res.json(mappings);
    }

    UserRoleMapping.find({user: user_id})
      .populate('user').populate('role').exec(found);
  };

  return UserRoleMappingController;

})();
