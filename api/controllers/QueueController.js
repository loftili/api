var Logger = require('../services/Logger'),
    DeviceAuthentication = require('../services/DeviceAuthentication'),
    http = require('http'),
    https = require('https');

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

  QueueController.stream = function(req, res) {
    var device_id = parseInt(req.params.id, 10),
        user_id = req.session.userid,
        auth_info = authInfo(req),
        track_to_play;

    if(!auth_info) return res.notFound('missing');


    function proxy(url) {
      var r = (/^https:\/\//i.test(url) ? https : http).get(url, connected);
      log('attempting to pipe ['+url+'] to ['+device_id+']');
      r.on('error', fail);
    }

    function connected(stream) {
      var h = stream.headers;
      log('received status['+stream.statusCode+'] from url');

      if(stream.statusCode > 300 && stream.statusCode < 400) {
        var location = stream.headers['location'];
        log('received redirect to ['+location+']');
        return proxy(location);
      }

      stream.pause();
      res.writeHeader(stream.statusCode, stream.headers);
      stream.pipe(res);
      stream.resume();
    }

    function startPipe() {
      var u = track_to_play.streamUrl();
      proxy(u);
    }

    function foundDevice(err, device) {
      if(err) return res.notFound('unable to locate device');
      return DeviceHistory.create({device: device.id, track: track_to_play.id}).exec(startPipe);
    }

    function finish(err, stream) {
      if(err)
        return res.badRequest('');

      if(!stream) {
        return res.notFound('missing [1]');
      }

      if(!stream.queue || stream.queue.length < 1) {
        return res.notFound('stream empty');
      }

      track_to_play = stream.queue[0];

      // if device is asking, add a history tag 
      if(auth_info.token && auth_info.serial)
        return Device.findOne({token: auth_info.token}, foundDevice);

      startPipe();
    }

    DeviceQueueService.find(device_id, auth_info, finish);
  };

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
