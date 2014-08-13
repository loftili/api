module.exports.http = (function(){

  return {

    middleware: {

      corsOptions: function(req, res, next) {
        if(req.method !== 'OPTIONS')
          next();
        else {
          CorsHeaderService.add(req, res);
          res.status(200).send();
        }
      },

      authorization: function(req, res, next) {
        next();
      },

      order: [
        'startRequestTimer',
        'cookieParser',
        'session',
        'bodyParser',
        'handleBodyParserError',
        'compress',
        'methodOverride',
        'authorization',
        'corsOptions',
        '$custom',
        'router',
        'www',
        'favicon',
        '404',
        '500'
      ],

    }

  };
  
  // cache: 31557600000
})();
