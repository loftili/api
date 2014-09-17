(function() {

  function Response() {
    this.properties = {
      status: 200,
      data: {}
    };
    this.final_callback = function() {};
  }

  Response.prototype.set = function(key, value) {
    this.properties[key] = value;
    return this;
  };

  Response.prototype.get = function(key) {
    var properties = this.properties,
        has_own = properties.hasOwnProperty(key);

    return has_own ? this.properties[key] : null;
  };

  Response.prototype.status = function(status_code) {
    return this.set('status', status_code);
  };

  Response.prototype.send = function() {
    this.final_callback();
    return this;
  };

  Response.prototype.json = function(data) {
    this.set('data', data);
    this.final_callback();
    return this;
  };

  Response.prototype.then = function(fn) {
    this.final_callback = fn;
  };

  module.exports = {

    Response: Response

  };

})();
