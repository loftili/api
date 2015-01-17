module.exports = (function() {

  var QueueController = {};

  QueueController.current = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        device_auth = req.headers["x-loftili-device-auth"],
        auth_info = {
          user: user_id,
          device: device_auth
        };

    function finish(err, track) {
      if(err) {
        sails.log('[QueueController][findOne] failed getting current track for queue');
        return res.status(404).send('');
      }
      return res.status(200).json(track);
    }
        
    sails.log('[QueueController][findOne] finding the current track for queue');
    DeviceQueueService.current(device_id, auth_info, finish);
  };

  QueueController.findOne = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        device_auth = req.headers["x-loftili-device-auth"],
        auth_info = {
          user: user_id,
          device: device_auth
        };

    function finish(err, queue) {
      if(err) {
        sails.log('[QueueController][findOne] failed getting queue for device[' + device_id + ']');
        return res.status(404).send('');
      }
      return res.status(200).json(queue);
    }
        
    sails.log('[QueueController][findOne] finding the queue belonging to device[' + device_id + ']');
    DeviceQueueService.find(device_id, auth_info, finish);
  };

  QueueController.move = function(req, res, next) {
    res.status(200).send('');
  };

  QueueController.remove = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        item_position = parseInt(req.params.position, 10),
        valid_position = item_position >= 0,
        device_auth = req.headers["x-loftili-device-auth"],
        auth_info = {
          device: device_auth,
          user: user_id
        };

    if(!user_id && !device_auth)
      return res.status(404).send('');

    if(!valid_position)
      return res.status(404).send('missing position index');

    function finish(err, queue) {
      if(err) {
        sails.log('[QueueController][remove] failed removing ['+item_position+'] from device['+device_id+']');
        return res.status(404).send('');
      }

      return res.status(200).json(queue);
    }

    sails.log('[QueueController][remove] removing position['+item_position+'] to device['+device_id+']');
    DeviceQueueService.remove(device_id, item_position, auth_info, finish);
  };

  QueueController.enqueue = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        track_id = parseInt(req.body.track, 10),
        valid_id = track_id >= 0,
        device_auth = req.headers["x-loftili-device-auth"],
        auth_info = {
          device: device_auth,
          user: user_id
        };

    if(!user_id) {
      return res.status(404).send('');
    }

    if(!valid_id)
      return res.status(404).send('missing track id');

    function finish(err, queue) {
      if(err) {
        sails.log('[QueueController][enqueue] failed queuing device[' + device_id + ']');
        return res.status(404).send('');
      }

      return res.status(200).json(queue);
    }

    sails.log('[QueueController][enqueue] adding track['+track_id+'] to device[' + device_id + ']');
    DeviceQueueService.enqueue(device_id, track_id, auth_info, finish);
  };

  QueueController.pop = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        auth_header = req.headers["x-loftili-device-auth"],
        auth_query_token = req.query && req.query.device_token ? req.query.device_token : false,
        auth_info = {
          device: auth_query_token || auth_header,
          user: user_id
        };

    sails.log('[QueueController][pop] header['+auth_header+'] query['+auth_query_token+']');

    if(!user_id && !auth_header && !auth_query_token) {
      sails.log('[QueueController][pop] unauthorized attempt to pop from a device queue['+device_id+']');
      return res.status(404).send('not authorized');
    }

    function finish(err, popped_track) {
      if(err) {
        sails.log('[QueueController][pop] failed popping');
        return res.status(404).send('');
      }

      if(!popped_track) {
        sails.log('[QueueController][pop] nothing left to pop!');
        return res.status(204).send('');
      }

      return res.status(200).json(popped_track);
    }

    sails.log('[QueueController][pop] popping');
    DeviceQueueService.pop(device_id, auth_info, finish);
  };

  return QueueController;

})();
