var bcrypt = require('bcrypt');

function makeSerial() {
  var serial_number = "";

  for(var i = 0; i < 40; i++)
    serial_number += "1";

  return serial_number;
}

exports.up = function(knex, Promise) {
  return knex.transaction(function(trx) {
    var serial_number = makeSerial();
    trx.insert({serial_number: serial_number}).into('device_serial').then(trx.commit);
  });
};

exports.down = function(knex, Promise) {
  var serial_number = makeSerial();
  return knex('device_serial').where('serial_number', serial_number).del();
};;

