module.exports.routes = {
  'GET /tracks/upload': 'TrackController.missing',
  'GET /auth': 'SessionController.index',
  'POST /auth': 'SessionController.login',
  'DELETE /auth': 'SessionController.logout'
};
