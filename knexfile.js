var dotenv = require('dotenv');

module.exports = (function() {

  var config = {};

  dotenv.load();

  config.production = config.development = {
    client: 'mysql',
    connection: {
      host: process.env['A2DBHN'],
      user: process.env['A2DBUN'],
      password: process.env['A2DBPW'],
      database: process.env['A2DBDB']
    },
    migrations: {
      tableName: 'migrations'
    }
  };

  return config;

})();
