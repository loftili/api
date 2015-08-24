'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('track', function (table) {
    table.string('pid');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('track', function (table) {
    table.dropColumn('pid');
  });
};
