'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('account_request', function (table) {
    table.increments();
    table.string('email');
    table.boolean('has_device');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('device');
};
