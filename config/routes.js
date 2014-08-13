module.exports.routes = {
  'GET /tracks/upload': 'TrackController.missing',
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',
  'GET /devices/:id/destroy': 'DeviceController.destroy'
};
