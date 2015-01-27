var bcrypt = require('bcrypt');

module.exports = (function()  {

  var SessionController = {};

  SessionController.index = function(req, res) {
    if(!req.session.userid)
      return res.status(401).send('');

    function finish(err, user) {
      if(err || !user)
        return res.status(401).send('');

      return res.json(user.toJSON());
    }

    var user = User.findOne({id: req.session.userid}).exec(finish);
  };

  SessionController.logout = function(req, res) {
    req.session.userid = null;
    req.session.role = null;
    req.session.username = null;

    return res.status(200).send();
  };

  SessionController.login = function(req, res) {
    var email = req.body.email,
        password = req.body.password;

    function doLogin(user, hash) {
      req.session.userid = user.id;
      req.session.username = user.username;
      req.session.role = user.role;

      var active_user = user.toJSON();
      return res.json(active_user);
    }

    function check(err, user) {
      if(err || !user || !password)
        return res.status(401).send('');

      bcrypt.compare(password, user.password, function(err, hash) {
        return (err || !hash) ? res.status(401).send() : doLogin(user, hash);
      });
    }

    User.findOne({email: email}).exec(check);
  };

  return SessionController;
	
})();
