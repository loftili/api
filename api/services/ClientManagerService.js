var crypto = require('crypto');

module.exports = (function() {

  var ClientManagerService = {};

  ClientManagerService.authenticateUser = function(client_key, user_token, callback) {
    var found_token,
        found_client;

    function check() {
      if(found_token && found_client)
        return callback(null, found_token.user);
    }

    function foundToken(err, token) {
      if(err || !token) {
        sails.log('[ClientManagerService] unable to find user');
        return callback('invalid token', null);
      }

      sails.log(token);
      sails.log('[ClientManagerService] successfully found user');
      found_token = token;

      check();
    }
    
    function foundClient(err, client) {
      if(err || !client) {
        sails.log('[ClientManagerService] unable to find client');
        return callback('invalid client', null);
      }

      sails.log('[ClientManagerService] successfully found client');
      found_client = client;
      
      check();
    }

    sails.log('[ClientManagerService] looking for client['+client_key+'] and token['+user_token+']');
    Client.findOne({consumer_key: client_key}).exec(foundClient);
    Clienttoken.findOne({token: user_token}).populate('user').exec(foundToken);
  };

  ClientManagerService.generateClientToken = function(client_id, user_id, callback) {
    var new_token = {},
        found_client,
        hasher = crypto.createHash('sha1');

    function finish(err, client_token) {
      return callback(err, client_token);
    }

    function generatedConsumer(err, buffer) {
      var token_buffer = buffer.toString('base64'),
          mixed = [token_buffer, found_client.consumer_secret].join(':');

      hasher.setEncoding('hex');
      hasher.write(mixed);
      hasher.end();

      new_token.token = hasher.read();

      sails.log('[ClientManagerService] generated random bytes, creating token');
      Clienttoken.create(new_token).exec(finish);
    }

    function foundClient(err, client) {
      if(err || !client) {
        sails.log('[ClientManagerService] unable to find matching client to request');
        return callback('missing client', null);
      }
      
      found_client = client;
      new_token.user = user_id;
      new_token.client = client_id;

      crypto.randomBytes(15, generatedConsumer);
    }

    Client.findOne({id: client_id}).exec(foundClient);
  };

  ClientManagerService.createClient = function(name, callback) {
    var new_client = {};
  
    function finish(err, client) {
      return callback(err, client);
    }

    new_client.name = name;

    function tryCreate() {
      if(new_client.consumer_secret && new_client.consumer_key)
        Client.create(new_client).exec(finish);
    }

    function generatedSecret(err, buffer) {
      new_client.consumer_secret = buffer.toString('base64');
      tryCreate();
    }

    function generatedConsumer(err, buffer) {
      new_client.consumer_key = buffer.toString('base64');
      tryCreate();
    }

    crypto.randomBytes(40, generatedSecret);
    crypto.randomBytes(15, generatedConsumer);

  };

  ClientManagerService.generateSecret = function() {
    var diffie = crypto.getDiffieHellman('modp5');
  };

  ClientManagerService.generateKey = function() {
  };

  return ClientManagerService;

})();
