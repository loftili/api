var crypto = require('crypto');

exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    var new_client = {
      name: 'loftili',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    function tryCreate() {
      if(new_client.consumer_secret && new_client.consumer_key) {
        trx.insert(new_client).into('client').then(trx.commit);
      }
    }

    function generatedSecret(err, buffer) {
      new_client.consumer_secret = buffer.toString('hex').substring(0, 40);
      tryCreate();
    }

    function generatedConsumer(err, buffer) {
      new_client.consumer_key = buffer.toString('hex').substring(0, 15);
      tryCreate();
    }

    crypto.randomBytes(40, generatedSecret);
    crypto.randomBytes(15, generatedConsumer);
  });
};

exports.down = function(knex, Promise) {
  return knex('client').where('name', 'loftili').del();
};
