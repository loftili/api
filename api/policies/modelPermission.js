module.exports = function modelPermission(req, res, next) {
  var session_user = parseInt(req.session.userid, 10),
      session_role = req.session.role,
      user_query = req.query ? parseInt(req.query.user, 10) : false;

  if(session_role > 1)
    return next();

  if(!user_query || session_user !== user_query)
    return res.status(404).send("");

  return next();
};
