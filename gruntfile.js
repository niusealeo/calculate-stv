module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        watch : {
            js : {
                files : ['src/*.js']
            }
        },
        mochaTest : {
            src : ['tests/*.js']
        },
        jshint : {
            files : ['src/*.js']
        }
    });

    grunt.registerTask('test', ['jshint', 'mochaTest']);
    grunt.registerTask('default', ['test']);
};
