module.exports.sockets = {

  path: '/sock',

  beforeConnect: function(handshake, cb) {
    return cb(null, true);
  },

  afterDisconnect: function() {
  },

  grant3rdPartyCookie: true,

  origins: '*:*'

};
