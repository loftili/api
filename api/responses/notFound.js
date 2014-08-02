module.exports = function notFound (data, options) {

  var req = this.req;
  var res = this.res;
  var sails = req._sails;

  res.status(404);

  if (data !== undefined) {
    sails.log.verbose('Sending 404 ("Not Found") response: \n',data);
  }
  else sails.log.verbose('Sending 404 ("Not Found") response');

  if (sails.config.environment === 'production') {
    data = undefined;
  }

  return res.jsonx(data);

};

