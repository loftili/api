'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('stream', function (table) {
    table.increments();
    table.string('title');
    table.string('description');
    table.integer('privacy');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('stream')
};
