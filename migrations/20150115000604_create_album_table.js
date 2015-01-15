'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('album', function (table) {
    table.increments();
    table.string('name');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('album');
};
