module.exports = function(grunt) {
    
    var codex = [
        "bower_components/knockout/knockout.debug.js",
        "bower_components/knockout-ES5/dist/knockout-es5.js",
        "bower_components/radio/radio.js",
        "bower_components/humane-js/humane.js",
        "../../ionosphere/build/ion.js",
        "../../ionosphere/build/atomic.js",
        "src/more.js",
        "src/codex.js"
    ];
    var css = [
        "fonts/fonts.css",
        "bower_components/humane-js/themes/original.css",
        "bower_components/bootstrap/dist/css/bootstrap.css",
        "bower_components/bootstrap/dist/css/bootstrap-theme.css",
        "src/codex.css",
        "src/renderers.css"
    ];
    
    grunt.initConfig({
        output: 'build',
    	pkg: grunt.file.readJSON('package.json'),
    	
    	clean: ['<%= output %>'],
    	
    	concat: {
    	    codex: {
                src: codex,
                dest: '<%= output %>/c.js'
    	    },
    	    css: {
    	        src: css,
    	        dest: '<%= output %>/c.css'
    	    }
    	},
    	
    	hub: {
    	    ion: {
    	        src: ['../../ionosphere/Gruntfile.js'],
    	        tasks: ['default']
    	    }
    	},
    	
    	jshint: {
    	    options: {
    	        evil: true // eval is not, in fact, evil. 
    	    },
    	    all: ['src/**/*.js']
    	},
    	
    	manifest: {
    	    generate: {
    	        options: {
    	            basePath: "build",
    	            preferOnline: false,
    	            timestamp: true
    	        },
    	        src: [
    	            "c.css",
    	            "c.min.js",
    	            "../images/route66.png",
    	            "../images/alert-overlay.png",
    	            "../fonts/fonts.css",
    	            "../fonts/karla-bold-italic.ttf",
    	            "../fonts/karla-bold.ttf",
    	            "../fonts/karla-italic.ttf",
    	            "../fonts/karla-regular.ttf"
	            ],
    	        dest: "build/codex.appmanifest"
    	    }
    	},
    	
    	uglify: {
    	    codex: {
    	        src: '<%= output %>/c.js',
    	        dest: '<%= output %>/c.min.js'
    	    }
    	},

        watch: {
            css: {
                files: css,
                tasks: ["default"],
                options: { spawn: false }
            },
            scripts: {
                files: codex,
                tasks: ["default"],
                options: { spawn: false }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-manifest');
    grunt.loadNpmTasks('grunt-hub');
    grunt.loadNpmTasks('grunt-contrib-watch');
    
    grunt.registerTask('default', ['hub','jshint','concat']);
    grunt.registerTask('release', ['jshint','concat','uglify','manifest']);
};
