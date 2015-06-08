'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('streampermission', function (table) {
    table.increments();
    table.integer('user');
    table.integer('stream');
    table.integer('level');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('streampermission');
};
