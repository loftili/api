'use strict';

exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    knex.schema.table('track', function (table) {
      table.string('provider');
    }).transacting(trx).then(function() {
      knex('track').where('id', '>', 0).update({
        provider: 'LF'
      }).transacting(trx).then(function() {
        trx.commit();
      });
    });
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('track', function (table) {
    table.dropColumn('provider');
  });
};
