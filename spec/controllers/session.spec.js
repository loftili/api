var Sails = require('sails'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers');

describe('The Session (Auth) Controller', function () {

  var app,
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
    app = sails;
    app.config.bootstrap(finished_lift);
  }

  before(function(done) {
    done_before = done;
    Sails.lift(lift_params, lifted);
  });

  after(function(done) {
    app.lower(done);
  });

  it('should return a 401 when no user', function(done) {
    var response = new helpers.Response(),
        code = null;

    function finish() {
      code = response.get('status');
      assert.equal(code, 401);
      done();
    }

    response.then(finish);
    app.controllers.session.index({session: {}}, response);
  });

  it('should return a 200 user found in session', function(done) {
    var response = new helpers.Response(),
        code = null, data = null;

    function finish() {
      code = response.get('status');
      data = response.get('data');
      assert.equal(code, 200);
      assert.equal(data.username, 'dadleyy');
      done();
    }

    response.then(finish);
    app.controllers.session.index({session: {user: 1}}, response);
  });

});
