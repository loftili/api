'use strict';

exports.up = function(knex, Promise) {

  function start(trx) {
    function finish() {
      trx.commit();
    }

    function renameUserRoleMappings() {
      knex.schema.renameTable('user_role_users__user_user_roles', 'user_role_user_mapping')
        .transacting(trx).then(finish);
    }

    function renameStreamPermission() {
      knex.schema.renameTable('streampermission', 'stream_user_mapping')
        .transacting(trx).then(renameUserRoleMappings);
    }

    knex.schema.renameTable('devicepermission', 'device_user_mapping')
      .transacting(trx).then(renameStreamPermission);
  }

  return knex.transaction(start);
};

exports.down = function(knex, Promise) {
  function start(trx) {
    function finish() {
      trx.commit();
    }

    function renameUserRoleMappings() {
      knex.schema.renameTable('user_role_user_mapping', 'user_role_users__user_user_roles')
        .transacting(trx).then(finish);
    }

    function renameStreamPermission() {
      knex.schema.renameTable('stream_user_mapping', 'streampermission')
        .transacting(trx).then(renameUserRoleMappings);
    }

    knex.schema.renameTable('device_user_mapping', 'devicepermission')
      .transacting(trx).then(renameStreamPermission);
  }


  return knex.transaction(start);
};
