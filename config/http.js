module.exports.http = {
  
  middleware: {

    order: [
      'startRequestTimer',
      'cookieParser',
      'session',
      'bodyParser',
      'handleBodyParserError',
      'compress',
      'methodOverride',
      '$custom',
      'router',
      'www',
      'favicon',
      '404',
      '500'
    ]

  }

  // cache: 31557600000
};
