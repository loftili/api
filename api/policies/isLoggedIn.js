module.exports = function(req, res, next) {
  var allowed_routes = [
        '/auth',
        '/registration'
      ],
      auth_needed = allowed_routes.indexOf(req.url) < 0;

  if(!req.session.userid && auth_needed)
    return res.status(401).send('unauthorized')
  else
    next();
};
