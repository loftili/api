module.exports.bootstrap = function(cb) {
  var completed = 0,
      errored = false,
      initial_users = [{
        email: 'danny@dadleyy.com',
        password: 'password',
        first_name: 'danny',
        last_name: 'hadley',
        username: 'dadleyy'
      }, {
        email: 'test1@loftili.com',
        password: 'password',
        first_name: 'test',
        last_name: 'test',
        username: 'test1'
      }, {
        email: 'test2@loftili.com',
        password: 'password',
        first_name: 'test',
        last_name: 'test',
        username: 'test2'
      }, {
        email: 'test3@loftili.com',
        password: 'password',
        first_name: 'test',
        last_name: 'test',
        username: 'test3',
        privacy_level: 5
      }];

  function finished() {
    cb();
  }

  User.query('DELETE FROM user whre id > 0', clearExisting);

  function addNext() {
    if(initial_users.length < 1)
      return finished();

    var next = initial_users.shift();
    User.create(next, addNext);
  }

  function clearExisting(err, users) {
    addNext();
  }

};
