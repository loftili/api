module.exports = {
	
  findOne: function(req, res) {
    var id_param = req.params.id,
        artist_id = parseInt(id_param, 10);

    function found(err, artist) {
      if(err)
        return res.status(404).send('');

      return res.status(200).json(artist);
    }

    Artist.findOne(artist_id).exec(found);
  }

};

