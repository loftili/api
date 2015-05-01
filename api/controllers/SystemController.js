var path = require('path');

module.exports = (function() {

  var SystemController = {},
      packagejs_path = path.join(__dirname, '..', '..', 'package.json'),
      pkg = require(packagejs_path),
      sockets = [];

  function log(msg) {
    sails.log('[SystemController]['+new Date()+'] ' + msg);
  }

  SystemController.index = function(req, res, next) {
    var info = {},
        git_tag = process.env['GIT_TAG'] || 'dev',
        query = req.query,
        message = query.message;

    info.version = [pkg.version, git_tag].join('-');

    return res.status(200).json(info);
  };

  return SystemController;

})();
