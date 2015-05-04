var cookies = require('cookie-parser');

module.exports.sockets = {

  path: '/sock',

  beforeConnect: function(connection, callback) {
    callback(null, true);
  },

  afterDisconnect: function(session, connection, callback) {
    DeviceSockets.users.remove(session.userid, callback);
  },

  grant3rdPartyCookie: true,

  origins: '*:*'

};
