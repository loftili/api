module.exports = (function() {

  var UserRoleMapping = {};

  UserRoleMapping.identity = 'UserRoleMapping';
  UserRoleMapping.tableName = 'user_role_users__user_user_roles';

  UserRoleMapping.attributes = {

    user: {
      model: 'User',
      required: true
    },

    role: {
      model: 'UserRole',
      required: true
    }

  };

  return UserRoleMapping;

})();
