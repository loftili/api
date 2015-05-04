var bcrypt = require('bcrypt');

exports.up = function(knex, Promise) {
  var first_user = {
    email: 'test2@loftili.com',
    password: 'password',
    first_name: 'test',
    last_name: 'testington',
    username: 'tester2'
  };

  return knex.transaction(function(trx) {
    function finish(err, hash) {
      first_user.password = hash;
      trx.insert(first_user).into('user').then(trx.commit);
    }

    bcrypt.hash(first_user.password, 10, finish);
  });
};

exports.down = function(knex, Promise) {
  return knex('user').where('email', 'test2@loftili.com').del();
};;
