module.exports.policies = (function() {

  var defaults = ['corsHeaders', 'isLoggedIn'],
      admin = defaults.concat(['admin']);

  return {

    '*': defaults,

    SystemController: {
      index: []
    },

    AccountRequestController: {
      create: ['corsHeaders'],
      find: admin,
      findOne: admin,
      destroy: admin
    },

    DeviceSerialController: {
      create: admin,
      destroy: admin
    },

    UserRolesController: {
      find: defaults
    },

    DeviceStreamController: {
      open: ['corsHeaders'],
      destroy: admin,
      find: admin
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
      stream: ['corsHeaders'],
      pop: ['corsHeaders']
    },

    DeviceStateController: {
      update: ['corsHeaders']
    }

  };

})();
