module.exports.routes = {

  'GET /system': 'SystemController.index',

  /* session */
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',

  'GET /sockets/devices': 'DeviceSocketController.find',
  'DELETE /sockets/devices/:id': 'DeviceSocketController.destroy',
  'GET /sockets/devices/:id': 'DeviceSocketController.subscribe',

  /* clients 
   */
  'GET /clients': 'ClientController.find',
  'POST /clients': 'ClientController.create',

  /* invitations
   */
  'DELETE /invitations/:id': 'InvitationsController.destroy',
  'GET /invitations': 'InvitationsController.find',
  'POST /invitations': 'InvitationsController.create',

  'POST /clientauth': 'ClientAuthController.authenticate',

  'POST /clienttokens': 'ClientTokenController.create',
  'GET /clienttokens': 'ClientTokenController.find',
  'DELETE /clienttokens/:id': 'ClientTokenController.destroy',

  /* users
   */
  'GET /users': 'UserController.find',
  'POST /users': 'UserController.create',
  'GET /users/:id': 'UserController.findOne',
  'PUT /users/:id': 'UserController.update',

  // depricated: //
  'GET /users/:id/tracks': 'UserController.tracks',
  'PUT /users/:id/tracks': 'UserController.addTrack',
  'DELETE /users/:id/tracks/:track_id': 'UserController.dropTrack',

  'POST /passwordreset': 'UserController.passwordReset',

  /* account requests
   */
  'GET /accountrequests': 'AccountRequestController.find',
  'GET /accountrequests/:id': 'AccountRequestController.findOne',
  'POST /accountrequests': 'AccountRequestController.create',
  'DELETE /accountrequests/:id': 'AccountRequestController.destroy',

  /* user roles
   */
  'GET /userroles': 'UserRolesController.find',
  'GET /userrolemapping': 'UserRoleMappingController.find',


  /* device & device management */

  /* registration
   * used by devices to allocate api tokens
   */
  'POST /registration': 'RegistrationController.register',

  /* device routes
   * used to manage device information, not necessarily the
   * state of the device itself
   */
  'POST /devices': 'DeviceController.create',
  'GET /devices': 'DeviceController.find',
  'GET /devices/:id': 'DeviceController.findOne',
  'PUT /devices/:id': 'DeviceController.update',
  'DELETE /devices/:id': 'DeviceController.destroy',
  
  /* device serials
   * serials are used by devices when first connecting with the api.
   * the majority of these routes have the admin policy associated with them
   */
  'GET /deviceserials': 'DeviceSerialController.find',
  'POST /deviceserials': 'DeviceSerialController.create',
  'DELETE /deviceserials/:id': 'DeviceSerialController.destroy',
  'GET /deviceserials/:id': 'DeviceSerialController.findOne',

  /* device history
   * a device's "history" is the list of tracks it has "popped"
   */
  'GET /history/:id/tracks': 'DeviceTrackHistoryController.find',
  'GET /history/:id/streams': 'DeviceStreamHistoryController.find',

  /* queues 
   * these endpoints are an abstraction of a combination of
   * both the device and it's stream. They should be exclusively
   * used by the core library.
   */
  'GET /queues/:id': 'QueueController.findOne',
  'POST /queues/:id/pop': 'QueueController.pop',
  'GET /queues/:id/stream': 'QueueController.stream',

  /* device states
   * the brains of the whole operation. PATCH is used to change
   * the state (which then gets reported to the device), and
   * PUT is used by the device to report back.
   */
  'PATCH /devicestates/:id/stream': 'DeviceStateController.stream',
  'PATCH /devicestates/:id/playback': 'DeviceStateController.playback',
  'PUT /devicestates/:id': 'DeviceStateController.update',
  'GET /devicestates/:id': 'DeviceStateController.findOne',

  /* device stream mapping
   * these routes are used to manage the association between a device and
   * a stream. Although this is represented in schema by a join table, it should
   * only ever be a one to many relationship between a stream and it's devices.
   * This could have been represented by an "stream" foreign key in the 
   * device table itself, but the concept of the stream's "alpha" 
   * (the device that does the real popping during playback) can be captured
   * in the join table
   */
  'GET /devicestreammappings': 'DeviceStreamMappingController.find',

  /* device permissions
   * the state of a device (which stream it is connected to) can be managed by
   * more than one user. these routes help that.
   */
  'GET /devicepermissions': 'DevicepermissionController.find',
  'POST /devicepermissions': 'DevicepermissionController.create',
  'DELETE /devicepermissions/:id': 'DevicepermissionController.destroy',

  /* streams 
   * the lists of tracks that will be played on devices subscribed to them.
   * devices are subscribed via the:
   *
   * PATCH /devicestates/:id/stream
   */
  'GET /streams': 'StreamController.find',
  'POST /streams': 'StreamController.create',
  'GET /streams/:id': 'StreamController.findOne',
  'DELETE /streams/:id': 'StreamController.destroy',
  'PUT /streams/:id': 'StreamController.update',
  'PUT /streams/:id/queue': 'StreamController.enqueue',
  'PATCH /streams/:id/queue': 'StreamController.move',
  'DELETE /streams/:id/queue/:position': 'StreamController.dequeue',

  /* stream permissions */
  'GET /streampermissions': 'StreamPermissionController.find',
  'POST /streampermissions': 'StreamPermissionController.create',
  'DELETE /streampermissions/:id': 'StreamPermissionController.destroy',

  /* tracks */
  'GET /tracks': 'TrackController.find',
  'POST /tracks/upload': 'TrackController.upload',
  'GET /tracks/sync': 'TrackController.sync',
  'GET /tracks/:id': 'TrackController.findOne',
  'GET /tracks/:id/preview': 'TrackController.preview',
  'PUT /tracks/:id': 'TrackController.update',
  'DELETE /tracks/:id': 'TrackController.destroy',

  /* artists */
  'GET /artists': 'ArtistController.find',
  'GET /artists/:id': 'ArtistController.findOne',

  /* async operations */
  'GET /async/:id': 'AsyncController.lookup',
  'GET /async': 'AsyncController.list'
};
