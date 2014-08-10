var dotenv = require('dotenv');

module.exports.cors = (function() {

  return {
    allRoutes: true,
    origin: '', // handled via cors policy
    credentials: true,
    methods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD'
  };

})();
