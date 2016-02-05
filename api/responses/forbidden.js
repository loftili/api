module.exports = (function() {

  function forbidden() {
    var req = this.req,
        res = this.res;

    return res.status(401).send("");
  }

  return forbidden;

})();

