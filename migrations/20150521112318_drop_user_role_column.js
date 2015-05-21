'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
    table.dropColumn('role');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
    table.integer('role');
  });
};
