var fs = require('fs'),
    jsftp = require("jsftp");

module.exports = {

  upload: function(req, res) {
    function afterCopy(err) {
      if(err) res.status(400).send('bad upload');
      return res.status(200).send('yay!');
    }

    function doCopy(err, data) {
      if(err) return res.status(400).send('bad');
      var ftp = new jsftp({
        host: process.env['STORAGE_HOST'],
        user: process.env['STORAGE_USER'],
        pass: process.env['STORAGE_PASS']
      });
      ftp.put(data, '/media/song.mp3', afterCopy);
    }

    function startCopy(file) {
      sails.log(file);
      if(!file.fd)
        return res.status(422).send('')
      fs.readFile(file.fd || file.path, doCopy);
    }

    function callback(err, files) {
      if (err)
        return res.serverError(err);

      if(files.length < 1)
        return res.status(400).send('no uploaded track');

      return startCopy(files[0]);
    }

    sails.log(req.files);
    req.file('file').upload(callback);
  },

  missing: function(req, res) {
    res.status(404).send('not found');
  }
	
};

