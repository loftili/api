var bcrypt = require('bcrypt');

module.exports = {

  index: function(req, res) {
    if(!req.session.user)
      return res.status(401).send('');

    function finish(err, user) {
      if(err || !user)
        return res.status(401).send('');

      return res.json(user.toJSON());
    }

    var user = User.findOne({id: req.session.user}).exec(finish);
  },

  logout: function(req, res) {
    req.session.user = null;
    return res.status(201).send();
  },

  login: function(req, res) {
    var email = req.body.email,
        password = req.body.password;

    function doLogin(user, hash) {
      req.session.user = user.id;
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
  }
	
};

