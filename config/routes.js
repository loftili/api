module.exports.routes = {
  'GET /tracks/upload': 'TrackController.missing',
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'GET /logout': 'SessionController.logout',
  'POST /dns': 'DnsController.create',
  'DELETE /dns': 'DnsController.destroy',
  'GET /devices/:id/ping': 'DeviceController.ping'
};
