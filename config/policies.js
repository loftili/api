module.exports.policies = (function() {

  var defaults = ['corsHeaders', 'isLoggedIn'];

  return {

    '*': defaults,

    UserController: {
      update: ['corsHeaders', 'userUpdatePermission']
    },

    RegistrationController: {
      register: ['corsHeaders']
    },

    ClientAuthController: {
      authenticate: ['corsHeaders']
    },
  
    QueueController: {
      findOne: ['corsHeaders'],
      enqueue: ['corsHeaders'],
      remove: ['corsHeaders'],
      move: ['corsHeaders'],
      pop: ['corsHeaders']
    },

    DeviceStateController: {
      update: ['corsHeaders']
    }

  };

})();
