'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('track', function (table) {
    table.increments();
    table.string('title');
    table.string('type');
    table.string('uuid');
    table.string('year');
    table.integer('artist');
    table.integer('album');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('track');
};
