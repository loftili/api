var dotenv = require('dotenv');

module.exports.cors = (function() {

  return {
    allRoutes: true,
    origin: '', // handled via cors policy
    credentials: true,
    methods: 'GET, POST, PATCH, PUT, DELETE, OPTIONS, HEAD, LINK'
  };

})();
