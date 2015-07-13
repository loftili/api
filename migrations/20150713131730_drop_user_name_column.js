'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
    table.dropColumn('name');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('user', function(table) {
    table.string('name');
  });
};
