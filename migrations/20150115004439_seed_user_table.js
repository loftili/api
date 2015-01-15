var bcrypt = require('bcrypt');

exports.up = function(knex, Promise) {
  var first_user = {
    email: 'danny@dadleyy.com',
    password: 'password',
    first_name: 'danny',
    last_name: 'hadley',
    username: 'dadleyy'
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
  return knex('user').where('email', 'danny@dadleyy.com').del();
};
