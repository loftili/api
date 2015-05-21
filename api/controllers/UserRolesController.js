module.exports = (function() {

  var UserRolesController = {};

  function log(msg) {
    return sails.log('[UserRolesController]['+new Date()+'] '+msg);
  }

  UserRolesController.find = function(req, res) {
    var user_id = parseInt(req.session.userid, 10);

    if(!(user_id > 0)) return res.forbidden();

    function found(err, roles) {
      if(err)
        return res.badRequest(err);

      return res.json(roles);
    }

    UserRole.find().exec(found);
  };

  return UserRolesController;

})();
