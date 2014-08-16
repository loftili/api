module.exports = {

  ping: function(req, res, next) {
    return res.json({"ping": false});
  }

};

