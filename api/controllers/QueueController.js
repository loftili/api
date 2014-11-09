module.exports = {

  findOne: function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid;

    function finish(err, queue) {
      if(err) {
        sails.log('[QueueController][findOne] failed getting queue for device[' + device_id + ']');
        return res.status(404).send('');
      }
      return res.status(200).json(queue);
    }

    sails.log('[QueueController][findOne] finding the queue belonging to device[' + device_id + ']');
    DeviceQueueService.find(device_id, user_id, finish);
  },

  move: function(req, res, next) {
    res.status(200).send('');
  },

  enqueue: function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        track_id = parseInt(req.body.track, 10),
        valid_id = track_id >= 0;

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
    DeviceQueueService.enqueue(device_id, track_id, user_id, finish);
  },

  dequeue: function(req, res, next) {
    res.status(200).send('');
  }

};
