module.exports.sockets = {

  path: '/sock',

  beforeConnect: function(handshake, cb) {
    sails.log('[::socket] connection inbound');
    return cb(null, true);
  },

  afterDisconnect: function() {
    sails.log('[::socket] connection closed');
  },

  grant3rdPartyCookie: true,

  origins: '*:*'

};
