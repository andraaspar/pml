module.exports = function(grunt) {
	'use strict';
	
	grunt.initConfig((function() {
		
		// Config template, completed by JS below
		
		var config = {
			
			// Variables to check
			
			CSS_NAME: 'desktop',
			CSS_PATH: '/style/',
			JS_NAME: 'script',
			JS_PATH: '/script/',
			JS_TO_CONCAT: [
				'<%= SRC_FOLDER %>/concat/jquery-1.11.2.min.js',
//				'<%= LODASH_IN_TEMP %>',
				'<%= MINIFIED_JS_IN_TEMP %>'
			],
//			LODASH_INCLUDE: ['cloneDeep', 'isEqual'],
			MAIN_LESS: '<%= SRC_FOLDER %>/less/_desktop.less',
			MAIN_TS: '<%= SRC_FOLDER %>/ts/pml/Main.ts',
			TEST_COUNT: 1,
			
			// Other variables
			
			BUILD_FOLDER: 'build',
			JS_IN_TEMP: '<%= TMP_FOLDER %>/script/<%= JS_NAME %>.js', 
			KAPOCS_PATTERN: ['**', '!_INFO'],
//			LODASH_IN_TEMP: '<%= TMP_FOLDER %>/script/lodash.js',
			MINIFIED_JS_IN_TEMP: '<%= TMP_FOLDER %>/script/<%= JS_NAME %>.min.js', 
			SRC_FOLDER: 'src',
			TEST_FOLDER: 'test',
			TMP_FOLDER: 'tmp',
			
			// Targets
			
//			appcache: {
//				compile: {
//					options: {
//						basePath: '<%= BUILD_FOLDER %>'
//					},
//					dest: '<%= BUILD_FOLDER %>/index.appcache',
//					cache: {
//						patterns: ['<%= BUILD_FOLDER %>/**', '!<%= BUILD_FOLDER %>/*.html']
//					},
//					network: '*'
//				}
//			},
			clean: {
				compile: [
					'<%= BUILD_FOLDER %>',
					'<%= TMP_FOLDER %>'
				]
			},
			concat: {
				compile: {
					src: '<%= JS_TO_CONCAT %>',
					dest: '<%= TMP_FOLDER %>/_asset_templates<%= JS_PATH %><%= JS_NAME %>.min.js'
				}
			},
			copy: {
				compile: {
					files:[{
						expand: true,
						cwd: '<%= SRC_FOLDER %>/_dropin',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_dropin',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}]
				},
				debug: {
					files: [
						{src: ['<%= JS_IN_TEMP %>'], dest: '<%= MINIFIED_JS_IN_TEMP %>'}
					]
				},
				tests: {
					files:[{
						expand: true,
						cwd: '<%= TEST_FOLDER %>/_dropin',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_dropin',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}]
				}
			},
			kapocs: {
				compile: {
					assets: [{
						expand: true,
						cwd: '<%= SRC_FOLDER %>/_assets',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_assets',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}],
					assetTemplates: [{
						expand: true,
						cwd: '<%= SRC_FOLDER %>/_asset_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_asset_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}],
					templates: [{
						expand: true,
						cwd: '<%= SRC_FOLDER %>/_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}]
				},
				tests: {
					assets: [{
						expand: true,
						cwd: '<%= TEST_FOLDER %>/_assets',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_assets',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}],
					assetTemplates: [{
						expand: true,
						cwd: '<%= TEST_FOLDER %>/_asset_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_asset_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}],
					templates: [{
						expand: true,
						cwd: '<%= TEST_FOLDER %>/_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}, {
						expand: true,
						cwd: '<%= TMP_FOLDER %>/_templates',
						dot: true,
						src: '<%= KAPOCS_PATTERN %>',
						dest: '<%= BUILD_FOLDER %>'
					}]
				}
			},
			less: {
				compile: {
					options: {
						compress: true
					},
					files: {
						'<%= TMP_FOLDER %>/_asset_templates<%= CSS_PATH %><%= CSS_NAME %>.css': '<%= MAIN_LESS %>'
					}
				},
				debug: {
					files: {
						'<%= TMP_FOLDER %>/_asset_templates<%= CSS_PATH %><%= CSS_NAME %>.css': '<%= MAIN_LESS %>'
					}
				},
				tests: {
					files: {/* Tests will be injected here. */}
				}
			},
//			lodash: {
//				compile: {
//					options: {
//						// modern, strict, compat
//						modifier: 'compat',
//						include: '<%= LODASH_INCLUDE %>'
//					},
//					dest: '<%= LODASH_IN_TEMP %>'
//				}
//			},
			typescript: {
				compile: {
					files: {
						'<%= JS_IN_TEMP %>': '<%= MAIN_TS %>'
					}
				},
				tests: {
					files: {/* Tests will be injected here. */}
				}
			},
			sas: {
				update: {/* No options required. */}
			},
			shell: {
				update: {
					command: [
						'bower prune',
						'bower update',
						'bower install'
					].join('&&')
				}
			},
			uglify: {
				compile: {
					files: {
						'<%= MINIFIED_JS_IN_TEMP %>': ['<%= JS_IN_TEMP %>']
					}
				}
			}
		};
		
		// Inject tests
		
		for (var i = 1; i <= config.TEST_COUNT; i++) {
			var folderPath = '<%= TMP_FOLDER %>/_asset_templates/test' + i;
			var jsPath = folderPath + '/script/test' + i + '.js';
			var cssPath = folderPath + '/style/test' + i + '.css';
			
			config.less.tests.files[cssPath] = 'test/less/test' + i + '/_desktop.less';
			config.typescript.tests.files[jsPath] = 'test/ts/test' + i + '/Main.ts';
		}
		
		return config;
	})());
	
//	grunt.loadNpmTasks('grunt-appcache');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-kapocs');
//	grunt.loadNpmTasks('grunt-lodash');
	grunt.loadNpmTasks('grunt-sas');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-typescript');
	
	grunt.registerTask('compile', [
		'clean:compile',
		'copy:compile',
		'typescript:compile',
		'uglify:compile',
//		'lodash:compile',
		'concat:compile',
		'less:compile',
		'kapocs:compile',
//		'appcache:compile',
	]);
	grunt.registerTask('debug', [
		'clean:compile',
		'copy:compile',
		'typescript:compile',
		'copy:debug',
//		'lodash:compile',
		'concat:compile',
		'less:debug',
		'kapocs:compile',
//		'appcache:compile',
	]);
	grunt.registerTask('tests', [
		'clean:compile',
		'copy:tests',
		'typescript:tests',
//		'lodash:compile',
		'less:tests',
		'kapocs:tests',
	]);
	grunt.registerTask('update', [
		'shell:update',
		'sas:update'
	]);
	grunt.registerTask('default', [
		'compile'
	]);
};