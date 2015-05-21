module.exports = (function() {

  var UserRole = {};

  UserRole.identity = 'UserRole';
  UserRole.tableName = 'user_roles';

  UserRole.attributes = {

    role: {
      type: 'string',
      required: true,
      unique: true
    }

  };

  return UserRole;

})();
