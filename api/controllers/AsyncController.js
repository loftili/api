var HttpAsync = require('../services/HttpAsync'),
    Logger = require('../services/Logger');

module.exports = (function() {

  var AsyncController = {},
      log = Logger('AsyncController');

  AsyncController.lookup = function(req, res) {
    var id = req.params.id;

    function finish(err, op) {
      if(!op) {
        log('operation not found['+id+']');
        return res.notFound('no operation found');
      }

      res.json({
        status: op.status()
      });
    }

    HttpAsync.lookup(id, finish);
  };

  AsyncController.list = function(req, res) {
    var registers = HttpAsync.registers(),
        count = registers.length,
        clean = [];

    for(var i = 0; i < count; i++) {
      var r = registers[i];
      clean.push({
        id: r.id,
        status: r.op.handle.status()
      });
    }

    res.json(clean);
  };

  return AsyncController;

})();
