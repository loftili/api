'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('track_users__user_tracks', function(table) {
    table.increments();
    table.integer('track_users');
    table.integer('user_tracks');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('track_users__user_tracks');
};
