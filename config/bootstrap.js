module.exports.bootstrap = function(cb) {
  var completed = 0,
      errored = false;

  function added(err, user) {
    if(errored)
      return false;

    if(err) {
      errored = true;
      return cb(err);
    }

    completed++;
    if(completed === 2)
      cb();
  }

  var danny = User.create({
    email: 'danny@dadleyy.com',
    password: 'password',
    first_name: 'danny',
    last_name: 'hadley',
    username: 'dadleyy'
  }, added);


  var test1 = User.create({
    email: 'test@loftili.com',
    password: 'password',
    first_name: 'test',
    last_name: 'test',
    username: 'test1'
  }, added);


};
