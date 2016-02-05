var Logger = require("./Logger");

module.exports = (function() {

  var UserSearch = {},
      log = Logger("UserSearch"),
      query_able = [
        "username",
        "first_name",
        "last_name",
        "email"
      ],
      hidden = [
        "createdAt",
        "updatedAt",
        "privacy_level",
        "first_name",
        "last_name",
        "email"
      ];

  function cleanse(user) {
    var r = {};

    for(var a in user) {
      if(!user.hasOwnProperty(a) || hidden.indexOf(a) >= 0) continue;
      r[a] = user[a];
    }

    return r;
  }

  function queryOr(query) {
    var results = [];

    for(var i = 0; i < query_able.length; i++) {
      var q = {};
      q[query_able[i]] = { "contains": query };
      results.push(q);
    }

    return results;
  }

  UserSearch.admin = function(query, callback) {

    function found(err, users) {
      if(err) {
        log("admin user search failed hard - " + err);
        return callback(err);
      }

      log("search result ["+users.length+"]");
      return callback(false, users);
    }

    log("admin search running - query["+query+"]");
    User.find({
      or: queryOr(query)
    }).exec(found);
  };

  UserSearch.visible = function(query, callback) {
    function found(err, users) {
      if(err) {
        log("error searching: " + err);
        return callback(err);
      }

      var cleansed = [],
          c = users.length;

      for(var i = 0; i < c; i++) {
        var u = users[i].toJSON(),
            cu = cleanse(u);

        cleansed.push(cu);
      }

      callback(false, cleansed);
    }

    function foundVisible(err, visible) {
      if(err) {
        log("error searching: " + err);
        return callback(err);
      }
      var ids = [],
          c = visible.length;

      for(var i = 0; i < c; i++)
        ids.push(visible[i].id)

      User.find({id: ids}).where({or: queryOr(query)}).exec(found);
    }

    User.find().where({
      or: [{
        privacy_level: { "<": 5 }
      }, {
        privacy_level: null
      }]
    }).exec(foundVisible);
  };

  return UserSearch;

})();
