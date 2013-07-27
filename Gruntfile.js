'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    clean: ['superagent.js', 'components'],
    mochacov: {
      test: {
        options: {
          reporter: 'dot'
        }
      },
      coverage: {
        reporter: 'html-cov'
      },
      docs: {
        reporter: 'doc'
      },
      options: {
        files: ['test/node/*.js'],
        require: ['should'],
        timeout: 2000,
        growl: true
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.registerTask('test', ['mochacov:test'])
  grunt.registerTask('test-cov', ['mochacov:coverage'])
};
