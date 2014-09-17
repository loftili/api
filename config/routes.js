module.exports.routes = {
  'GET /tracks/upload': 'TrackController.missing',

  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',

  'GET /users/search': 'UserController.search',

  'GET /logout': 'SessionController.logout',

  'POST /dns': 'DnsController.create',
  'DELETE /dns': 'DnsController.destroy',

  'GET /devices/:id/ping': 'DeviceController.ping',

  'POST /registration': 'RegistrationController.register',

  'POST /playback/start': 'PlaybackController.start',
  'POST /playback/stop': 'PlaybackController.stop'
};
