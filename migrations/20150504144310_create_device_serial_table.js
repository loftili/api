'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('device_serial', function (table) {
    table.increments();
    table.string('serial_number');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
    /* possibly more information - manufacturer, etc... */
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('device_serial');
};
