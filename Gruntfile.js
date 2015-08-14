module.exports = function(grunt) {
	'use strict';
	
	grunt.initConfig({
			
		KAPOCS_PATTERN: ['**', '!_INFO'],
		
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
				}, {
					expand: true,
					cwd: 'node_modules/mocha',
					dot: true,
					src: 'mocha.js',
					dest: 'tmp/_assets/script'
				}, {
					expand: true,
					cwd: 'node_modules/mocha',
					dot: true,
					src: 'mocha.css',
					dest: 'tmp/_assets/style'
				}, {
					expand: true,
					cwd: 'node_modules/chai',
					dot: true,
					src: 'chai.js',
					dest: 'tmp/_assets/script'
				}, {
					expand: true,
					cwd: 'node_modules/sinon/lib',
					dot: true,
					src: '**',
					dest: 'tmp/_assets/script'
				}, {
					expand: true,
					cwd: 'node_modules/requirejs',
					dot: true,
					src: 'require.js',
					dest: 'tmp/_assets/script'
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
			mocha: {
				command: '"node_modules/.bin/mocha" --reporter dot "build/script/tests.*.js"'
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
		'shell:mocha',
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