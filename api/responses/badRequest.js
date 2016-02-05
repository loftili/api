module.exports = (function() {

  function badRequest(data) {
    var req = this.req,
        res = this.res;

    if(data)
      sails.log("[response][badRequest] data["+data+"]");

    res.status(400);

    return data ? res.json(data) : res.send("");
  }

  return badRequest;

})();
