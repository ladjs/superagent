'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    clean: ['superagent.js', 'components']
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
};
