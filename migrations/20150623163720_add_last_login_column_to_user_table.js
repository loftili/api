'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('user', function (table) {
    table.dateTime('last_login');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user', function (table) {
    table.dropColumn('last_login');
  });
};
