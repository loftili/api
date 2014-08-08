var dotenv = require('dotenv');

module.exports.connections = (function() {

  if(!process.env['A2DBHN'])
    dotenv.load();

  return {

    a2_db: {
      adapter: 'sails-mysql',
      host: process.env['A2DBHN'],
      user: process.env['A2DBUN'],
      password: process.env['A2DBPW'],
      database: process.env['A2DBDB']
    }

  };

})();
