module.exports.sockets = {

  path: '/sock',

  beforeConnect: function(handshake, cb) {
    sails.log(arguments);
    return cb(null, true);
  },

  onConnect: function() {
    sails.log('[::socket] new connection');
  },

  grant3rdPartyCookie: true,

  authorization: function() {
    sails.log('[::socket] authorization');
  },

  origins: '*:*'

};
