var namejs = require('namejs'),
    dotenv = require('dotenv'),
    domain = require('../../config/domain');

module.exports = (function() {

   dotenv.load();
	
  var client = new namejs.Client({
        token: process.env['NAMEAPI_TOKEN'],
        username: process.env['NAMEAPI_USER']
      }),
      name_domain = domain.subdomain_parent;

  return {

    deleteRecord: function(user, device, callback) {
      var subdomain = [device.name, user.username].join('.');

      function success() {
        sails.log('[DnsManagerSerice.deleteRecord.success] successfully deleted: ' + subdomain);
        callback(false, 'ok!');
      }

      function fail(err) {
        sails.log('[DnsManagerSerice.deleteRecord.fail] failed deleting: ' + subdomain + ' -> ' + err);
        callback('failed', false);
      }

      sails.log('deleting a subdomain: ' + subdomain);
      client.deleteSubdomain(name_domain, subdomain).then(success, fail);
    },

    createRecord: function(user, device, callback) {
      var subdomain = [device.name, user.username].join('.'),
          ip_addr = device.ip_addr;

      function success() {
        sails.log('[DnsManagerSerice.createRecord.success] successfully created: ' + subdomain);
        callback(false, 'ok!');
      }

      function fail(err) {
        sails.log('[DnsManagerSerice.createRecord.failed] failed creating: ' + subdomain + ' -> ' + err);
        callback('failed', false);
      }

      sails.log('[DnsManagerSerice.createRecord] creating a new subdomain: ' + subdomain + ' -> ' + ip_addr);
      client.createSubdomain(name_domain, subdomain, ip_addr).then(success, fail);
    },

    updateRecord: function(user, device, callback) {
      var record_name = [device.name, user.username].join('.'),
          ip_addr = device.ip_addr;

      function finish() {
        sails.log('[DnsManagerSerice.updateRecord] recreated record for ' + record_name + ' -> ' + ip_addr);
        callback();
      }

      function create() {
        sails.log('[DnsManagerSerice.updateRecord] deleted record for ' + record_name + ' -> ' + ip_addr);
        client.createSubdomain(name_domain, record_name, ip_addr).then(finish, fail);
      }

      function fail() {
        sails.log('[DnsManagerSerice.updateRecord] failed deleting record for ' + record_name + ' -> ' + ip_addr);
        callback();
      }

      sails.log('[DnsManagerSerice.updateRecord] updating record for ' + record_name + ' -> ' + ip_addr);
      client.deleteSubdomain(name_domain, record_name).then(create, fail);
    }

  };

})();
