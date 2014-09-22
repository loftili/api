var Sails = require('sails/lib/app'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers');

describe('The modelPermission policy', function () {

  var app = Sails(),
      lift_params = {
        log: {
          level: 'error'
        }
      },
      done_before,
      modelPermission;

  function finished_lift() {
    modelPermission = app.hooks.policies.middleware.modelpermission;
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

  it('should return a 404 if there is no query in the request for "find"', function(done) {
    var response = new helpers.Response();

    function finish() {
      var code = response.get('status');
      assert.equal(code, 404);
      done();
    }

    response.then(finish);
    modelPermission({session: {}}, response, function() {});
  });

  it('should continue if the session has a role greater than 1', function(done) {
    var next = sinon.spy(),
        response = new helpers.Response();
    modelPermission({session: {role: 2}}, response, next);
    assert.equal(true, next.called);
    done();
  });

  it('should not continue if the session has a role less than 2', function(done) {
    var response = new helpers.Response(),
        next = sinon.spy();

    function finish() {
      var code = response.get('status');
      assert.equal(false, next.called);
      assert.equal(404, code);
      done();
    }

    response.then(finish);
    modelPermission({session: {role: 1}}, response, next);
  });

});
