var cookies = require('cookie-parser');

module.exports.sockets = {

  path: '/sock',

  beforeConnect: function(connection, callback) {
    callback(null, true);
  },

  afterDisconnect: function() {
  },

  grant3rdPartyCookie: true,

  origins: '*:*'

};
