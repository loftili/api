module.exports = (function() {

  function notFound() {
    var req = this.req,
        res = this.res;

    res.status(404);

    return res.send('not found');
  }

  return notFound;

})();
