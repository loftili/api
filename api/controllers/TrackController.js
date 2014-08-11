var fs = require('fs'),
    path = require('path'),
    id3 = require('id3js');

module.exports = {

  upload: function(req, res) {
    var track_props = {},
        file_path  = null;

    function done(err, uploaded_track) {
      if(err)
        return res.status(422).send('');

      return res.json(uploaded_track);
    }

    function createCb(err, created) {
      if(err) 
        return res.status(422).json(err);

      Track.findOne({id: created.id}).populate('artist').exec(done);
    }

    function loadedTags(err, tags) {
      if(err) 
        return res.status(422).json(err);

      track_props = Track.parseTags(track_props, tags);
      Track.create(track_props).exec(createCb);
    }

    function afterCopy(err) {
      if(err) 
        return res.status(400).send('couldn\'t upload: ' + err);

      id3({file: file_path, type: id3.OPEN_LOCAL}, loadedTags);
    }

    function doCopy(err, data) {
      if(err) 
        return res.status(400).send('bad');

      var storage_filename = [track_props.bucket_name, track_props.type].join('.'),
          storage_path = path.join('/tracks', storage_filename);

      MediaUploadService.upload(data, storage_path, afterCopy);
    }

    function startCopy(file) {
      if(!file.fd)
        return res.status(422).send('')

      var matches = file.fd.match(/^.*\/uploads\/(.*)\.(\w+)$/),
          type_match = file.type.match(/^audio\/(\w+)$/);

      if(!matches || matches.length < 3)
        return res.status(422).send('');

      if(!type_match || type_match.length < 2)
        return res.status(422).send('unsupported media type');

      track_props.bucket_name = matches[1];
      track_props.type = type_match[1];
      track_props.users = [req.session.user];
      file_path = file.fd;

      if(Track.supported_types.indexOf(track_props.type) < 0)
        return res.status(422).send('unsupported media type');
      
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

