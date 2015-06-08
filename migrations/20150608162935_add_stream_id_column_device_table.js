'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('device', function (table) {
    table.integer('stream');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('device', function (table) {
    table.dropColumn('stream');
  });
};
