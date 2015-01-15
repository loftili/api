'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('devicepermission', function (table) {
    table.increments();
    table.integer('user');
    table.integer('device');
    table.integer('level');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('devicepermission');
};
