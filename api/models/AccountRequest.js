module.exports = (function() {

  var AccountRequest = {};

  AccountRequest.tableName = "account_request";

  AccountRequest.attributes = {

    email: {
      type: "string",
      required: true,
      unique: true,
      email: true
    },

    has_device: {
      type: "boolean",
      defaultsTo: true
    }

  };

  return AccountRequest;

})();
