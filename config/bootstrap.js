var uuid = require('node-uuid');

module.exports.bootstrap = function(cb) {
  var completed = 0,
      errored = false,
      initial_users = [{
        email: 'danny@dadleyy.com',
        password: 'password',
        first_name: 'danny',
        last_name: 'hadley',
        username: 'dadleyy',
        role: 10
      }, {
        email: 'test1@loftili.com',
        password: 'password',
        first_name: 'test',
        last_name: 'test',
        username: 'test1'
      }, {
        email: 'test2@loftili.com',
        password: 'password',
        first_name: 'test',
        last_name: 'test',
        username: 'test2'
      }, {
        email: 'test3@loftili.com',
        password: 'password',
        first_name: 'test',
        last_name: 'test',
        username: 'test3',
        privacy_level: 5
      }];

  function finished() {
    cb();
  }

  function addTrack() {
    var temp_uuid = uuid.v4();

    Track.create({
      title: 'Test',
      uuid: temp_uuid
    }, finished);
  }

  function addPermission() {
    Devicepermission.create({
      user: 1,
      device: 1,
      level: 1
    }, addTrack);
  }

  function addDevice() {
    Device.create({
      name: 'testing',
      hostname: '',
      ip_addr: '127.0.0.1',
      port: 80
    }, addPermission);
  }

  User.query('DELETE FROM user whre id > 0', clearExisting);

  function addUser() {
    if(initial_users.length < 1)
      return addDevice();

    var next = initial_users.shift();
    User.create(next, addUser);
  }

  function clearExisting(err, users) {
    addUser();
  }

};
