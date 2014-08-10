module.exports = function(req, res, next) {

  if(/^\/auth$/.test(req.url)) 
    return next();

  if(req.session.user === null)
    return res.status(401).send('');

  return next();

};
