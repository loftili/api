module.exports.bootstrap = function(cb) {
  var completed = 0,
      errored = false,
      initial_users = [{
        email: 'danny@dadleyy.com',
        password: 'password',
        first_name: 'danny',
        last_name: 'hadley',
        username: 'dadleyy'
      }];

  function finished() {
    cb();
  }

  User.query('DELETE FROM user whre id > 0', clearExisting);

  function addNext() {
    if(initial_users.length < 1)
      return finished();

    var next = initial_users.pop();
    User.create(next, addNext);
  }

  function clearExisting(err, users) {
    addNext();
  }

};
