'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('invitation', function(table) {
    table.increments();
    table.integer('from');
    table.string('token', 10);
    table.string('to');
    table.integer('accepted');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('invitation');
};
