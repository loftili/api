module.exports = function(req, res, next) {
  var allowed_origins = [
        'http://local-ui.lofti.li',
        'http://app.lofti.li',
        'http://beta.app.lofti.li'
      ],
      origin_header = req.headers.origin,
      origin_index = allowed_origins.indexOf(origin_header),
      is_allowed = origin_index >= 0;

  if(!is_allowed)
    return res.status(401).send('');

  res.setHeader('Access-Control-Allow-Origin', allowed_origins[origin_index]);

  next();
};
