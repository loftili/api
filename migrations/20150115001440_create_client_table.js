'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('client', function(table) {
    table.increments();
    table.string('name');
    table.string('consumer_key', 15);
    table.string('consumer_secret', 40);
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('client');
};
