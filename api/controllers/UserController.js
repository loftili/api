module.exports = {

  search: function(req, res) {
    var query = req.query,
        user_query = query ? (query.q||'').toLowerCase() : false;

    if(!user_query)
      return res.status(404).send('Not found');

    function callback(err, users) {
      if(err) {
        sails.log('[UserController][search] SQL error:');
        sails.log(err);
        return res.status(500).send('');
      }

      var matching = [],
          index = [],
          user, username, email;

      for(var index = 0; index < users.length; index++) {
        user = users[index];
        username = user.username.toLowerCase();
        email = user.email.toLowerCase();

        if(email.indexOf(user_query) > -1 || username.indexOf(user_query) > -1)
          matching.push(user);
      }

      return res.status(200).json(matching);
    }

    User.query('SELECT username, email FROM user WHERE private_flag = false', callback);
  }
	
};

