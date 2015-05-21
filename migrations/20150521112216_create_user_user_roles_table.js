'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('user_role_users__user_user_roles', function(table) {
    table.increments();
    table.integer('role');
    table.integer('user');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_role_users__user_user_roles');
};
