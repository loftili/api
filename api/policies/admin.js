module.exports = (function() {

  function isAdmin(req, res, next) {
    var user_id = parseInt(req.session.userid),
        valid_id = user_id > 0;

    if(!valid_id) return res.forbidden();

    function finish(is_admin) {
      return is_admin ? next() : res.forbidden();
    }

    isAdmin.check(user_id, finish);
  }

  isAdmin.check = function(user_id, callback) {
    function foundRoles(err, roles) {
      if(err) return callback(false);

      var count = roles.length;

      for(var i = 0; i < count; i++) {
        var role = roles[i].role,
            name = role.role;

        if(/admin/i.test(name)) return callback(true);
      }

      return callback(false);
    }

    UserRoleMapping.find({user: user_id}).populate("role").exec(foundRoles);
  };

  return isAdmin;

})();
