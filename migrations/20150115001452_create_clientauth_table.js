'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('clientauth', function(table) {
    table.increments();
    table.integer('client');
    table.integer('user');
    table.string('token', 40);
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clientauth');
};
