var Sails = require('sails/lib/app'),
    sinon = require('sinon'),
    assert = require('assert'),
    helpers = require('../helpers'),
    uuid = require('node-uuid');

describe('The track model', function () {

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

  it('should add streaming url from json format', function(done) {
    var test_uuid = uuid.v4();

    function finish(err, track) {
      assert.equal(typeof track.toJSON().streaming_url, "string");
      done();
    }

    Track.create({
      title: "test track",
      uuid: test_uuid
    }, finish);

  });

  after(function(done) {
    app.lower(done);
  });

});
