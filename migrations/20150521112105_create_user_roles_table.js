'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('user_roles', function(table) {
    table.increments();
    table.string('role');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_roles');
};
