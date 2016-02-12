var Logger = require("../services/Logger");

module.exports = (function() {

  var ArtistController = {},
      log = Logger("ArtistController");

  ArtistController.find = function(req, res) {
    var q = req.query.q;

    function found(err, artists) {
      if(err) {
        log("error looking up artists: " + err);
        return res.serverError();
      }

      return res.json(artists);
    }

    Artist.find().exec(found);
  };
	
  ArtistController.findOne = function(req, res) {
    var id_param = req.params.id,
        artist_id = parseInt(id_param, 10);

    function found(err, artist) {
      if(err) return res.notFound("");
      return res.status(200).json(artist);
    }

    Artist.findOne(artist_id).exec(found);
  };

  return ArtistController;

})();
