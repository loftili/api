'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('user', function (table) {
    table.increments();
    table.string('name');
    table.string('email');
    table.string('first_name');
    table.string('last_name');
    table.string('username');
    table.integer('role');
    table.integer('privacy_level');
    table.string('reset_token');
    table.string('password');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('user')
};
