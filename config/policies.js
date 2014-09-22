module.exports.policies = {

  '*': ['isLoggedIn', 'corsHeaders'],

  DevicepermissionController: {
    find: ['isLoggedIn', 'corsHeaders', 'modelPermission']
  }

};
