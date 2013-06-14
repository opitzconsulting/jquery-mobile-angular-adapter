module.exports = function(grunt) {

  // needed for karma to locate phantomjs correctly.
  process.env.PHANTOMJS_BIN = './node_modules/.bin/phantomjs';
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      normal: {
        options: {
          banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '* <%= pkg.homepage %>\n' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n'
        },
        src: [
          "src/amd.js.start",
          "src/integration/widgetPatches.js",
          "src/integration/precompileSupport.js",
          "src/integration/scopeDigestExtension.js",
          "src/integration/compileIntegration.js",
          "src/integration/jqmNgWidgetProvider.js",
          "src/integration/widgetAdapters.js",
          "src/integration/history.js",
          "src/integration/ngmRouting.js",
          "src/integration/ngRepeatPatch.js",
          "src/integration/ngOptionsPatch.js",
          "src/integration/option.js",
          "src/integration/li.js",
          "src/integration/ngSwitchPatch.js",
          "src/integration/ngIncludePatch.js",
          "src/integration/ngInputPatch.js",
          "src/utils/if.js",
          "src/utils/event.js",
          "src/utils/sharedController.js",
          "src/utils/waitDialog.js",
          "src/utils/paging.js",
          "src/amd.js.end"
        ],
        dest: 'compiled/<%= pkg.name %>.js'
      },
      standalone: {
        src: [
          "lib/jquery.js",
          "src/mobileinit.js",
          "lib/jquery.mobile.js",
          "lib/angular.js",
          "<%= concat.normal.dest %>"
        ],
        dest: 'compiled/<%= pkg.name %>-standalone.js'
      }
    },
    uglify: {
      options: {
        preserveComments: 'some'
      },
      normal: {
        files: {
          'compiled/<%= pkg.name %>.min.js': ['compiled/<%= pkg.name %>.js']
        }
      },
      standalone: {
        files: {
          'compiled/<%= pkg.name %>-standalone.min.js': ['compiled/<%= pkg.name %>-standalone.js']
        }
      }
    },
    watch: {
      files: ['src/**/*','test/**/*'],
      tasks: ['jshint', 'concat', 'testacularRun:dev']
    },
    jshint: {
      files: ['src/**/*.js', 'test/**/*Spec.js'],
      options: {
        strict: false,
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: false,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        trailing: true,
        globals: {
          describe: true,
          ddescribe: true,
          beforeEach: true,
          afterEach: true,
          it: true,
          xit: true,
          iit: true,
          runs: true,
          waitsFor: true,
          waits: true,
          spyOn: true,
          expect: true,
          jasmine: true,
          uitest: true,
          testutils: true,
          window: true,
          document: true,
          history: true,
          location: true,
          $: true,
          angular: true,
          inject: true,
          module: true,
          uit: true,
          dump: true
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 9000,
          base: './',
          hostname: ''
        }
      }
    },
    testacular: {
      dev: {
        options: {
          configFile: 'testacular.conf.js',
          singleRun: false,
          browsers: ['PhantomJS'],
          keepalive: false
        }
      },
      travis: {
        options: {
          configFile: 'testacular.conf.js',
          singleRun: true,
          browsers: ["PhantomJS"],
          keepalive: true,
          captureTimeout: 10000
        }
      },
      localBuild: {
        options: {
          configFile: 'testacular.conf.js',
          singleRun: true,
          browsers: ['PhantomJS'],
          keepalive: true
        }
      }
    },
    testacularRun: {
      dev: {
        options: {
          runnerPort: 9100
        }
      }
    }
  });

  grunt.registerTask('dev', ['connect','testacular:dev','watch']);

  grunt.registerTask('default', ['jshint','concat','uglify','connect','testacular:localBuild']);

  grunt.registerTask('travis', ['jshint','concat','uglify','connect','testacular:travis']);

  grunt.loadNpmTasks('grunt-testacular');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
};