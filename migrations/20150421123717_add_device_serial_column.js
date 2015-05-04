'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.table('device', function (table) {
    table.string('serial_number');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('device', function (table) {
    table.dropColumn('serial_number');
  });
};
