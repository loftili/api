module.exports = (function() {

  function depreciated() {
    var req = this.req,
        res = this.res;

    res.status(404).send([
      [req.method, req.path].join(' '),
      'this route is no longer supported.'
    ].join('\r\n'));
  }

  return depreciated;

})();
