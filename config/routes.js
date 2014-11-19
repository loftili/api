module.exports.routes = {
  /* Session */
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',

  /* User information*/
  'GET /users/search': 'UserController.search',
  'GET /users/:id/tracks': 'UserController.tracks',
  'PUT /users/:id/tracks': 'UserController.addTrack',
  'PUT /users/:id': 'UserController.update',
  'POST /passwordreset': 'UserController.passwordReset',
  
  /* Dns */
  'POST /dns': 'DnsController.create',
  'DELETE /dns': 'DnsController.destroy',

  /* Device & Device management */
  'GET /devices/:id/ping': 'DeviceController.ping',
  'GET /devices/:id': 'DeviceController.findOne',
  'DELETE /devices/:id': 'DeviceController.destroy',

  'POST /registration': 'RegistrationController.register',

  'GET /queues/:id': 'QueueController.findOne',
  'POST /queues/:id/move': 'QueueController.move',
  'POST /queues/:id': 'QueueController.enqueue',
  'POST /queues/:id/pop': 'QueueController.pop',

  'POST /playback/start': 'PlaybackController.start',
  'POST /playback/stop': 'PlaybackController.stop',

  /* Device visibility */
  'GET /devicepermissions': 'DevicepermissionController.find',
  'POST /devicepermissions': 'DevicepermissionController.create',
  'DELETE /devicepermissions/:id': 'DevicepermissionController.destroy',

  /* Tracks */
  'GET /tracks': 'TrackController.find',
  'GET /tracks/scout': 'TrackController.scout',
  'GET /tracks/search': 'TrackController.search',
  'POST /tracks/upload': 'TrackController.upload',
  'PUT /tracks/:id': 'TrackController.update',

  /* Tracks */
  'GET /artists/:id': 'ArtistController.findOne'
};
