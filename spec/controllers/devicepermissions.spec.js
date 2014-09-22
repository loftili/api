var Sails = require('sails/lib/app'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers');

describe('The Devicepermission Controller', function () {

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

});
