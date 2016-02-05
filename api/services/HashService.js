var bcrypt = require('bcrypt');

module.exports = function(object, property, cb) {

  function finish(err, hash) {
    if(err) 
      cb(err, false);

    object[property] = hash;
    cb(false, object);
  }

  function doHash() {
    bcrypt.hash(object[property], 10, finish);
  }

  if(object[property])
    return doHash();

  cb('no property', false);
};
