module.exports = (function() {

  function serverError(data) {
    var req = this.req,
        res = this.res;

    if(data)
      sails.log("[response][serverError] data["+data+"]");

    res.status(500).send("server error");
  };

  return serverError;

})();
