'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('clienttoken', function(table) {
    table.increments();
    table.integer('client');
    table.integer('user');
    table.string('token', 9);
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('clienttoken');
};
