'use strict';

exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    trx.insert([{
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    }]).into('user_roles').then(trx.commit);
  });
};

exports.down = function(knex, Promise) {
  return knex('user_roles').whereIn('role', ['admin', 'user']).del();
};
