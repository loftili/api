var Logger = require('../services/Logger'),
    DeviceAuthentication = require('../services/DeviceAuthentication');

module.exports = (function() {

  var QueueController = {},
      log = Logger('QueueController');

  function authInfo(req) {
    var user_id = parseInt(req.session.userid, 10),
        device_headers = DeviceAuthentication.parseRequest(req);

    if(device_headers)
      return device_headers;

    return user_id > 0 ? {user: user_id} : false;
  }

  QueueController.findOne = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        auth_info = authInfo(req);

    if(!auth_info)
      return res.notFound('not found [0]');

    function finish(err, stream) {
      if(err) {
        log('failed getting queue for device['+device_id+']: ' + err);
        return res.notFound();
      }

      if(!stream) {
        log('device['+device_id+'] has no stream!');
        return res.notFound();
      }

      if(!stream.queue || !(stream.queue.length > 0)) {
        log('device['+device_id+'] has discovered stream['+stream.id+'] is empty!');
        return res.notFound();
      }

      return res.status(200).json(stream);
    }
        
    DeviceQueueService.find(device_id, auth_info, finish);
  };

  QueueController.pop = function(req, res, next) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        auth_info = authInfo(req);

    if(!auth_info)
      return res.notFound('not found [0]');

    function finish(err, popped_track) {
      if(err) {
        log('failed popping: ' + err);
        return res.notFound();
      }

      if(!popped_track) {
        log('nothing left to pop!');
        return res.notFound();
      }

      DeviceSockets.users.broadcast(device_id, 'QUEUE_UPDATE');
      return res.status(200).json(popped_track);
    }

    DeviceQueueService.pop(device_id, auth_info, finish);
  };

  return QueueController;

})();
