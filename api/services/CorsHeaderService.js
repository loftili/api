module.exports = (function() {
  var methods = [
    'OPTIONS',
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE'
  ],
  headers = [
    'Content-Type',
    'Origin',
    'Accept',
    'Authorization'
  ],
  allowed_origins = [
    'http://local-ui.lofti.li',
    'http://app.lofti.li',
    'http://beta.app.lofti.li'
  ];
  
  return {

    add: function(req, res) {
      var origin_header = req.get('Origin');
          origin_index = allowed_origins.indexOf(origin_header);

      res.setHeader('Access-Control-Allow-Credentials', true);
      res.setHeader('Access-Control-Allow-Origin', allowed_origins[origin_index] || allowed_origins[0]);
      res.setHeader('Access-Control-Allow-Methods', methods.join());
      res.setHeader('Access-Control-Allow-Headers', headers.join());
    }

  };

})();
