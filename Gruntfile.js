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
    },
    component: {
      install: { options: { action: 'install' } },
      build: {
        options: {
          action: 'build',
          args: {
            standalone: 'superagent',
            out: '.',
            name: 'superagent'
          }
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mocha-cov');
  grunt.loadNpmTasks('grunt-component');
  grunt.registerTask('test', ['mochacov:test']);
  grunt.registerTask('test-cov', ['mochacov:coverage']);
  grunt.registerTask('components', ['component:install']);
  grunt.registerTask('superagent.js', ['component']);
  grunt.registerTask('default', ['component']);
};
