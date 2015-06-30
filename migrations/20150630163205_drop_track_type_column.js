'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('track', function(table) {
    table.dropColumn('type');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('track', function(table) {
    table.string('type');
  });
};
