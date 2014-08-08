module.exports = {

  upload: function(req, res) {
    function callback(err, files) {
      if (err)
        return res.serverError(err);

      if(files.length < 1)
        return res.status(400).send('no uploaded track');

      return res.json({'status': 'ok'});
    }

    req.file('track').upload(callback);
  },

  missing: function(req, res) {
    res.status(404).send('not found');
  }
	
};

