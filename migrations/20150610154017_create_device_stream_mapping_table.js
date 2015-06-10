'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('device_stream_mapping', function(table) {
    table.increments();
    table.integer('device');
    table.integer('stream');
    table.boolean('alpha');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('device_stream_mapping');
};
