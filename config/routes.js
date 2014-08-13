module.exports.routes = {
  'GET /tracks/upload': 'TrackController.missing',
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',
  'PUT /devices/:id/register': 'DeviceController.register'
};
