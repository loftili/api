'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('device', function (table) {
    table.increments();
    table.string('name');
    table.string('registered_name');
    table.string('ip_addr');
    table.string('token');
    table.string('port');
    table.dateTime('last_checked');
    table.boolean('loop_flag');
    table.dateTime('createdAt');
    table.dateTime('updatedAt');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('device');
};
