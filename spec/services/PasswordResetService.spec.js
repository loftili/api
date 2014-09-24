var Sails = require('sails/lib/app'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers');

describe('The PasswordReset service', function () {

  var app = Sails(),
      lift_params = {
        log: {
          level: 'error'
        }
      },
      done_before,
      PasswordResetService;

  function finished_lift() {
    PasswordResetService = app.services.passwordresetservice;
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

  it('should execute callback function with "missing" error if no user found', function(done) {
    function finish(err, user) {
      assert.equal(err, 'missing');
      done();
    }

    PasswordResetService.reset(100, finish);
  });

  it('should execute callback function with "invalid" error if bad input', function(done) {
    function finish(err, user) {
      assert.equal(err, 'invalid');
      done();
    }

    PasswordResetService.reset('thisisnothing', finish);
  });

});
