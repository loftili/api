var path = require('path'),
    dotenv = require('dotenv');

module.exports = function(grunt) {

  if(!process.env['A2DBDB'])
    dotenv.load();

  grunt.loadNpmTasks('grunt-mocha-test');

  var db = {
        hostname: process.env['A2DBHN'],
        username: process.env['A2DBUN'],
        password: process.env['A2DBPW'],
        database: process.env['A2DBDB']
      };

  grunt.initConfig({
    mochaTest: {
      test: {
        options: {
          timeout: 15000,
          reporter: 'spec'
        },
        src: ['spec/**/*.spec.js']
      }
    }
  });

  grunt.registerTask('test', ['mochaTest']);
  grunt.registerTask('prod', []);
  grunt.registerTask('default', []);

};
