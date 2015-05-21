module.exports.policies = (function() {

  var defaults = ['corsHeaders', 'isLoggedIn'];

  return {

    '*': defaults,

    SystemController: {
      index: []
    },

    DeviceSerialController: {
      find: defaults.concat(['admin']),
      create: defaults.concat(['admin']),
      destroy: defaults.concat(['admin'])
    },

    UserRolesController: {
      find: defaults
    },

    DeviceStreamController: {
      open: ['corsHeaders']
    },

    SessionController: {
      logout: ['corsHeaders'],
      link: []
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
