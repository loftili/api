var fs = require('fs'),
    jsftp = require('jsftp'),
    path = require('path');

module.exports = {

  upload: function(req, res) {
    var name = null,
        type = null;

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
          }),
          ftp_path = path.join('/media', [name, type].join('.'));

      ftp.put(data, ftp_path, afterCopy);
    }

    function startCopy(file) {
      sails.log(file);

      if(!file.fd)
        return res.status(422).send('')

      var matches = file.fd.match(/^.*\/uploads\/(.*)\.(\w+)$/);
      if(!matches || matches.length < 3)
        return res.status(422).send('');

      name = matches[1];
      type = matches[2];

      fs.readFile(file.fd, doCopy);
    }

    function callback(err, files) {
      if (err)
        return res.serverError(err);

      if(files.length < 1)
        return res.status(400).send('no uploaded track');

      return startCopy(files[0]);
    }

    req.file('file').upload(callback);
  },

  missing: function(req, res) {
    res.status(404).send('not found');
  }
	
};

