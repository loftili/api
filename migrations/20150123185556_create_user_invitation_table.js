'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('user_invitation', function(table) {
    table.increments();
    table.integer('user')
    table.integer('invitation')
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user_invitation');
};
