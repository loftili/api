var namejs = require('namejs'),
    dotenv = require('dotenv');

module.exports = (function() {

   dotenv.load();
	
  var client = new namejs.Client({
        token: process.env['NAMEAPI_TOKEN'],
        username: process.env['NAMEAPI_USER']
      }),
      name_domain = 'lofti.li';

  return {

    updateRecord: function(user, device, callback) {
      var record_name = [device.name, user.username].join('.'),
          ip_addr = device.ip_addr;

      sails.log('[DnsManagerSerice.updateRecord] Updating record for ' + record_name + ' -> ' + ip_addr);

      function finish() {
        sails.log('[DnsManagerSerice.updateRecord] Recreated record for ' + record_name + ' -> ' + ip_addr);
        callback();
      }

      function create() {
        sails.log('[DnsManagerSerice.updateRecord] Deleted record for ' + record_name + ' -> ' + ip_addr);
        client.createSubdomain(name_domain, record_name, ip_addr).then(finish, fail);
      }

      function fail() {
        callback();
      }

      client.deleteSubdomain(name_domain, record_name).then(create, fail);
    }

  };

})();
