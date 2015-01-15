var crypto = require('crypto');

exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    var new_token = {
      user: 1,
      client: 1
    };

    function generated(err, buffer) {
      new_token.token = buffer.toString('hex').substring(0, 9);
      trx.insert(new_token).into('clienttoken').then(trx.commit);
    }

    crypto.randomBytes(30, generated);
  });
};

exports.down = function(knex, Promise) {
  return knex('clienttoken').where({
    user: 1,
    client: 1
  }).del();
};
