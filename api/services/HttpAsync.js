var uuid = require('node-uuid'),
    lodash = require('lodash'),
    core = {
      events: require('events')
    };

module.exports = (function() {

  var HttpAsync = {},
      registers = [],
      STATUSES = {
        OPEN: 'OPEN',
        FINISHED: 'FINISHED',
        ERRORED: 'ERRORED'
      };

  function lookup(id, callback) {
    var count = registers.length,
        found = null;

    for(var i = 0; i < count; i++) {
      var r = registers[i];

      if(r.id === id) {
        found = r;
        break;
      }
    }

    if(!found)
      return callback('missing');

    return callback(false, found.op);
  }

  function remove(id) {
    var count = registers.length,
        found = null;

    for(var i = 0; i < count; i++) {
      var r = registers[i];

      if(r.id === id) {
        found = i;
        break;
      }
    }

    if(found !== null)
      registers.splice(found, 1);
  }

  HttpAsync.registers = function() { return registers; }

  HttpAsync.AsyncOperation = function() {
    var handle = {},
        wrapper = {},
        events = new core.events.EventEmitter(),
        status = STATUSES.OPEN;

    handle.on = lodash.bind(events.on, events);
    handle.emit = lodash.bind(events.emit, events);

    handle.status = function() {
      return status;
    };

    wrapper.handle = handle;

    wrapper.update = function(s) {
      status = s;
    };

    return wrapper;
  };

  HttpAsync.start = function(req, res) {
    var register_id = uuid.v4();

    res.status(202);
    res.json({
      process_id: register_id
    });

    registers.push({
      id: register_id,
      op: HttpAsync.AsyncOperation()
    });

    return register_id;
  };

  HttpAsync.finish = function(id, status) {
    function update(err, op) {
      if(err)
        return false;

      op.update(status || STATUSES.FINISHED);
    }

    lookup(id, update);
  };

  HttpAsync.lookup = function(id, callback) {
    function finish(err, operation) {
      var handle = operation && operation.handle;

      if(err || !handle)
        return callback(err);

      var status = handle.status(),
          is_finished = status === STATUSES.FINISHED,
          did_error = status === STATUSES.ERRORED;
          
      if(is_finished || did_error)
        remove(id);

      callback(false, handle);
    }

    return lookup(id, finish);
  };

  HttpAsync.STATUSES = STATUSES;

  return HttpAsync;

})();
