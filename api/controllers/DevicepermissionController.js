module.exports = {

  find: function(req, res) {
    var session_user = req.session.userid,
        device_query = req.query.device,
        user_query = req.query.user,
        where_clause = {
          user: session_user
        };

    function found(err, permissions) {
      if(err)
        return res.status(404).send(err);

      return res.status(200).json(permissions);
    }

    if(device_query)
      where_clause.device = device_query;

    Devicepermission.find(where_clause).populate('device').exec(found);
  },


  create: function(req, res) {
    var device_id = req.body.device,
        user_id = req.body.user,
        level = req.body.level,
        owner = req.session.userid,
        params = {
          device: device_id,
          sharer: owner,
          level: level,
          target: user_id
        };

    function finish(err, record) {
      return err ? res.status(404).send(err) : res.json(record);
    }

    DeviceShareService.share(params, finish);
  }

};

