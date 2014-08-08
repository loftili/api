var path = require('path'),
    dotenv = require('dotenv');

module.exports = function(grunt) {

  if(!process.env['A2DBDB'])
    dotenv.load();

  var db = {
        hostname: process.env['A2DBHN'],
        username: process.env['A2DBUN'],
        password: process.env['A2DBPW'],
        database: process.env['A2DBDB']
      };

  grunt.registerTask('default', []);

};
