module.exports.policies = (function() {

  var defaults = ['isLoggedIn', 'corsHeaders'];

  return {

    '*': defaults,

    UserController: {
      update: defaults.slice(1).concat(['userUpdatePermission'])
    }

  };

})();
