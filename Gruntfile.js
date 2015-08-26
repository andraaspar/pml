module.exports = function(grunt) {
	'use strict';
	
	grunt.initConfig({
			
		KAPOCS_PATTERN: ['**'],
		
		clean: {
			compile: [
				'build',
				'tmp'
			],
			update: ['lib']
		},
		copy: {
			tests: {
				files: [{
					expand: true,
					cwd: 'test/_dropin',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}, {
					expand: true,
					cwd: 'tmp/_dropin',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}]
			},
			update: {
				files: [{
					expand: true,
					cwd: 'bower_components/illa/src',
					dot: true,
					src: '**',
					dest: 'lib'
				}, {
					expand: true,
					cwd: 'bower_components/node-d-ts/src',
					dot: true,
					src: '**',
					dest: 'lib'
				}, {
					expand: true,
					cwd: 'node_modules/typescript/bin',
					dot: true,
					src: 'lib.core.es6.d.ts',
					dest: 'lib'
				}]
			}
		},
		kapocs: {
			tests: {
				assets: [{
					expand: true,
					cwd: 'test/_assets',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}, {
					expand: true,
					cwd: 'tmp/_assets',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}],
				assetTemplates: [{
					expand: true,
					cwd: 'test/_asset_templates',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}, {
					expand: true,
					cwd: 'tmp/_asset_templates',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}],
				templates: [{
					expand: true,
					cwd: 'test/_templates',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}, {
					expand: true,
					cwd: 'tmp/_templates',
					dot: true,
					src: '<%= KAPOCS_PATTERN %>',
					dest: 'build'
				}]
			}
		},
		shell: {
			jasmine: {
				command: '"node_modules/.bin/jasmine"'
			},
			update: {
				command: [
					'bower prune',
					'bower update',
					'bower install'
				].join('&&')
			},
			tests: {
				command: '"node_modules/.bin/tsc" --noLib --out "tmp/_asset_templates/script/tests.js" "test/ts/tests/Main.ts"'
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-kapocs');
	grunt.loadNpmTasks('grunt-shell');
	
	grunt.registerTask('tests', [
		'clean:compile',
		'copy:tests',
		'shell:tests',
		'kapocs:tests',
		'shell:jasmine',
	]);
	grunt.registerTask('update', [
		'shell:update',
		'clean:update',
		'copy:update'
	]);
	grunt.registerTask('default', [
		'tests'
	]);
};