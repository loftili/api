'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('device_history', function(table) {
    table.increments();
    table.integer('device');
    table.integer('track');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('device_history');
};
