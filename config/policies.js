module.exports.policies = (function() {

  var defaults = ['corsHeaders'];

  return {

    '*': defaults,

    UserController: {
      update: defaults.concat(['userUpdatePermission'])
    }

  };

})();
