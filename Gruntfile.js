'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      files: [
        'index.js',
        'Gruntfile.js',
        'package.json',
        'requirements.json',
        '.jshintrc',
        'lib/**/*.js',
        'spec/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.registerTask('jasmine-node', '', function() {
    var exec = require('child_process').exec;
    var done = this.async();
    var jasmine;

    jasmine = exec('jasmine-node --captureExceptions spec');
    jasmine.stdout.pipe(process.stdout);
    jasmine.stderr.pipe(process.stderr);
    jasmine.on('exit', function(code) { done(code === 0); });
  });


  grunt.registerTask('test', ['jshint', 'jasmine-node']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('pre-commit', ['default']);

};
