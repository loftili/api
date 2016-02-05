var AWS = require("aws-sdk"),
    path = require("path");

module.exports = (function() {

  var config_file = path.join(__dirname, "..", "..", "config", "aws.json"),
      config = require(config_file);
 
  AWS.config.loadFromPath(config_file);

  return {

    upload: function(data, path, callback) {
      var s3 = new AWS.S3(),
          params = {
            Bucket: config.bucket,
            Key: path,
            Body: data
          };

      sails.log.info("uploading to amazon: " + path);

      function finish(err, data) {
        if(err)
          callback(err);

        callback();
      }

      s3.putObject(params, finish);
    }

  };

})();
