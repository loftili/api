'use strict';

exports.up = function(knex, Promise) {
   return knex.transaction(function(trx) {
    trx.insert([{
      role: 1,
      user: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    }]).into('user_role_users__user_user_roles').then(trx.commit);
  });
};

exports.down = function(knex, Promise) {
  return knex('user_role_users__user_user_roles').whereIn('id', [1]).del();
};
