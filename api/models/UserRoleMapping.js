module.exports = (function() {

  var UserRoleMapping = {};

  UserRoleMapping.identity = "UserRoleMapping";

  UserRoleMapping.tableName = "user_role_user_mapping";

  UserRoleMapping.attributes = {

    user: {
      model: "User",
      required: true
    },

    role: {
      model: "UserRole",
      required: true
    }

  };

  return UserRoleMapping;

})();
