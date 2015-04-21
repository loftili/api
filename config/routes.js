module.exports.routes = {

  'GET /system': 'SystemController.index',
  'GET /sk': 'SystemController.socket',

  /* Session */
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',

  'GET /clients': 'ClientController.find',
  'POST /clients': 'ClientController.create',

  'DELETE /invitations/:id': 'InvitationsController.destroy',
  'GET /invitations': 'InvitationsController.find',
  'POST /invitations': 'InvitationsController.create',

  'GET /devicehistory': 'DeviceHistoryController.find',

  'POST /clientauth': 'ClientAuthController.authenticate',

  'POST /clienttokens': 'ClientTokenController.create',
  'GET /clienttokens': 'ClientTokenController.find',
  'DELETE /clienttokens/:id': 'ClientTokenController.destroy',

  /* User information*/
  'POST /users': 'UserController.create',
  'GET /users/search': 'UserController.search',
  'GET /users/:id/tracks': 'UserController.tracks',
  'PUT /users/:id/tracks': 'UserController.addTrack',
  'DELETE /users/:id/tracks/:track_id': 'UserController.dropTrack',
  'PUT /users/:id': 'UserController.update',
  'POST /passwordreset': 'UserController.passwordReset',
  
  /* Dns */
  'POST /dns': 'DnsController.create',
  'DELETE /dns': 'DnsController.destroy',

  /* Device & Device management */
  'GET /devices/:id/ping': 'DeviceController.ping',
  'GET /devices/:id': 'DeviceController.findOne',
  'PUT /devices/:id': 'DeviceController.update',
  'DELETE /devices/:id': 'DeviceController.destroy',

  'POST /registration': 'RegistrationController.register',

  'GET /queues/:id/current': 'QueueController.current',
  'GET /queues/:id': 'QueueController.findOne',
  'PUT /queues/:id': 'QueueController.enqueue',
  'POST /queues/:id/move': 'QueueController.move',
  'DELETE /queues/:id/:position': 'QueueController.remove',
  'POST /queues/:id/pop': 'QueueController.pop',

  'POST /playback/restart': 'PlaybackController.restartPlayback',
  'POST /playback/start': 'PlaybackController.startPlayback',
  'POST /playback/stop': 'PlaybackController.stopPlayback',

  'PUT /devicestates/:id': 'DeviceStateController.update',
  'GET /devicestates/:id': 'DeviceStateController.findOne',

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
  'DELETE /tracks/:id': 'TrackController.destroy',

  /* Tracks */
  'GET /artists/:id': 'ArtistController.findOne'
};
