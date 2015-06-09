module.exports.routes = {

  'GET /system': 'SystemController.index',

  /* Session */
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',

  // see bootstrap.js
  // 'SUBSCRIBE /devicestreams': 'DeviceStreamController.open',
  // depricated:
  // 'GET /devicestreams/open': 'DeviceStreamController.open',

  'GET /devicestreams': 'DeviceStreamController.find',
  'DELETE /devicestreams/:id': 'DeviceStreamController.destroy',
  'GET /devicestreams/:id': 'DeviceStreamController.subscribe',

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
  'GET /users': 'UserController.find',
  'GET /users/:id/tracks': 'UserController.tracks',
  'PUT /users/:id/tracks': 'UserController.addTrack',
  'DELETE /users/:id/tracks/:track_id': 'UserController.dropTrack',
  'PUT /users/:id': 'UserController.update',
  'POST /passwordreset': 'UserController.passwordReset',
  
  /* Device serials */
  'GET /deviceserials': 'DeviceSerialController.find',
  'POST /deviceserials': 'DeviceSerialController.create',
  'DELETE /deviceserials/:id': 'DeviceSerialController.destroy',
  'GET /deviceserials/:id': 'DeviceSerialController.findOne',

  /* Account Requests */
  'GET /accountrequests': 'AccountRequestController.find',
  'GET /accountrequests/:id': 'AccountRequestController.findOne',
  'POST /accountrequests': 'AccountRequestController.create',
  'DELETE /accountrequests/:id': 'AccountRequestController.destroy',

  /* User Roles */
  'GET /userroles': 'UserRolesController.find',

  /* User Roles Mapping */
  'GET /userrolemapping': 'UserRoleMappingController.find',

  /* Device & Device management */
  'POST /devices': 'DeviceController.create',
  'GET /devices': 'DeviceController.find',
  'GET /devices/:id': 'DeviceController.findOne',
  'PUT /devices/:id': 'DeviceController.update',
  'DELETE /devices/:id': 'DeviceController.destroy',

  'GET /registration': 'RegistrationController.register',
  'POST /registration': 'RegistrationController.register',

  /* streams */
  'GET /streams': 'StreamController.find',
  'POST /streams': 'StreamController.create',
  'DELETE /streams/:id': 'StreamController.destroy',
  'PUT /streams/:id': 'StreamController.update',
  'PUT /streams/:id/queue': 'StreamController.enqueue',
  'DELETE /streams/:id/queue/:position': 'StreamController.dequeue',
  'GET /streams/:id': 'StreamController.findOne',

  'GET /streampermissions': 'StreamPermissionController.find',
  'POST /streampermissions': 'StreamPermissionController.create',
  'DELETE /streampermissions/:id': 'StreamPermissionController.destroy',

  'GET /queues/:id/current': 'QueueController.current',
  'GET /queues/:id': 'QueueController.findOne',
  'PUT /queues/:id': 'QueueController.enqueue',
  'POST /queues/:id/move': 'QueueController.move',
  'DELETE /queues/:id/:position': 'QueueController.remove',
  'POST /queues/:id/pop': 'QueueController.pop',

  'POST /playback/restart': 'PlaybackController.restart',
  'POST /playback/start': 'PlaybackController.start',
  'POST /playback/stop': 'PlaybackController.stop',
  'POST /playback/skip': 'PlaybackController.skip',

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
  'GET /tracks/:id': 'TrackController.findOne',
  'PUT /tracks/:id': 'TrackController.update',
  'DELETE /tracks/:id': 'TrackController.destroy',

  /* Tracks */
  'GET /artists/:id': 'ArtistController.findOne'
};
