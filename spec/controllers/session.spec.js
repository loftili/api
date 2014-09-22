var Sails = require('sails/lib/app'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers');

describe('The Session (Auth) Controller', function () {

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
    app.config.bootstrap(finished_lift);
  }

  before(function(done) {
    done_before = done;
    app.lift(lift_params, lifted);
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
    app.controllers.session.index({session: {userid: 1}}, response);
  });

  it('should set the username, user and role attributes in the session hash', function(done) {
    var response = new helpers.Response(),
        request = {
          session: {},
          body: {
            email: 'test1@loftili.com',
            password: 'password'
          }
        };

    assert.equal(request.session.role, undefined);

    function finish() {
      assert.equal(request.session.username, 'test1');
      assert.equal(request.session.role, 1);
      done();
    }

    response.then(finish);
    app.controllers.session.login(request, response);
  });

});
