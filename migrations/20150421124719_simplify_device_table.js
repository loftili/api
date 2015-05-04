'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('device', function(table) {
    table.dropColumn('ip_addr');
    table.dropColumn('port');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('device', function(table) {
    table.string('ip_addr');
    table.string('port');
  });
};
