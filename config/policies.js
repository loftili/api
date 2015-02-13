module.exports.policies = (function() {

  var defaults = ['corsHeaders', 'isLoggedIn'];

  return {

    '*': defaults,

    SystemController: {
      index: [],
    },

    SessionController: {
      logout: ['corsHeaders']
    },

    UserController: {
      create: ['corsHeaders'],
      update: ['corsHeaders', 'userUpdatePermission']
    },

    RegistrationController: {
      register: ['corsHeaders']
    },

    ClientAuthController: {
      authenticate: ['corsHeaders']
    },

    InvitationsController: {
      find: ['corsHeaders']
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
