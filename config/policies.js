module.exports.policies = (function() {

  var defaults = ['isLoggedIn', 'corsHeaders'];

  return {

    '*': defaults,

    DevicepermissionController: {
      find: defaults.concat(['modelPermission'])
    },

    UserController: {
      update: defaults.slice(1).concat(['userUpdatePermission'])
    }

  };

})();
