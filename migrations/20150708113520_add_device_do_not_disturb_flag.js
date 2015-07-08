'use strict';

exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    function addColumn(table) {
      table.boolean('do_not_disturb');
    }

    function finish() {
      trx.commit();
    }

    function updateColumns() {
      var params = {do_not_disturb: false};
      knex('device').where('id', '>', 0).update(params)
        .transacting(trx).then(finish);
    }

    knex.schema.table('device', addColumn)
      .transacting(trx).then(updateColumns);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('device', function (table) {
    table.dropColumn('do_not_disturb');
  });
};
