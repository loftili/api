var Sails = require('sails/lib/app'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers');

describe('The User Controller', function () {

  var app = Sails(),
      lift_params = {
        log: {
          level: 'error'
        }
      },
      done_before;

  function finished_lift() {
    done_before();
  }

  function lifted(err, sails) {
    if(err)
      console.log(err);

    app.config.bootstrap(finished_lift);
  }

  before(function(done) {
    done_before = done;
    app.lift(lift_params, lifted);
  });

  after(function(done) {
    app.lower(done);
  });

  it('should return a 404 when no user', function(done) {
    var response = new helpers.Response(),
        code = null;

    function finish() {
      code = response.get('status');
      assert.equal(code, 404);
      done();
    }

    response.then(finish);
    app.controllers.user.search({query: {q: 'asdasda'}}, response);
  });

  it('should return an array with two users found', function(done) {
    var response = new helpers.Response(),
        code = null, data = null;

    function finish() {
      code = response.get('status');
      data = response.get('data');
      assert.equal(code, 200);
      assert.equal(data.length, 2);
      done();
    }

    response.then(finish);
    app.controllers.user.search({query: {q: 'test'}}, response);
  });

});
