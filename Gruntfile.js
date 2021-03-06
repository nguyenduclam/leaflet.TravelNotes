module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		eslint: {
			options: {
				fix: true,
				configFile: '.eslintrc.json'
			},				
			target: ['src/**/*.js']
		},	
		rollup : {
			Default : {
				options : {
					format : 'iife'
				},
				files: {
				  'tmp/TravelNotes.min.js': ['src/main/main.js'],  
				  'tmp/TravelNotesViewer.min.js': ['src/main/mainViewer.js'],  
				  'tmp/TravelNotesRoadbook.min.js': ['src/roadbook/roadbook.js']				  
				}
			}
		},
		includes: {
			Polyline: {
				files: {
					'src/polyline/Polyline.js' : ['src/polyline/Polyline.template']
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.html' : ['src/html/TravelNotesRoadbook.html']
				}
			}
		},
		cssmin: {
			options: {
				mergeIntoShorthands: false,
				roundingPrecision: -1
			},
			TravelNotes: {
				files: {
					'tmp/TravelNotes.min.css': [ 'src/**/*.css']
				}
			},
			Viewer: {
				files: {
					'tmp/TravelNotesViewer.min.css': [ 'src/css/Map.css', 'src/css/Notes.css', 'src/css/NotesIcons.css', 'src/css/Popup.css', 'src/UI/AttributionsUI.css', 'src/UI/ErrorsUI.css','src/UI/ViewerLayersToolbarUI.css' ]
				}
			},
			Roadbook: {
				files: {
					'tmp/TravelNotesRoadbook.min.css': [ 'src/dialogs/ProfileWindow.css', 'src/css/NotesIcons.css', 'src/roadbook/Roadbook.css' ]
				}
			}
		},
		uglify: {
			TravelNotes: {
				options: {
					banner: '\n/*!\n<%= pkg.name %> - version <%= pkg.version %> ' + 
						'\nbuild <%= pkg.buildNumber %> - ' + 
						'<%= grunt.template.today("isoDateTime") %> ' + 
						'\nCopyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe ' + 
						'\nContact: http://www.ouaie.be/' + 
						'\nSources: <%= pkg.sources %> ' + 
						'\nLicense: <%= pkg.license %>\n*/\n\n',
					mangle: true,
					beautify: false
				},
				files: {
					'tmp/TravelNotes.min.js': ['tmp/TravelNotes.min.js']
				}
			},
			Viewer: {
				options: {
					banner: '\n/*!\n<%= pkg.name %> - version <%= pkg.version %> ' + 
						'\nbuild <%= pkg.buildNumber %> - ' + 
						'<%= grunt.template.today("isoDateTime") %> ' + 
						'\nCopyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe ' + 
						'\nContact: http://www.ouaie.be/' + 
						'\nSources: <%= pkg.sources %> ' + 
						'\nLicense: <%= pkg.license %>\n*/\n\n',
					mangle: true,
					beautify: false
				},
				files: {
					'tmp/TravelNotesViewer.min.js': ['tmp/TravelNotesViewer.min.js']
				}
			},
			Roadbook: {
				options: {
					banner: '\n/*!\n<%= pkg.name %> - version <%= pkg.version %> ' + 
						'\nbuild <%= pkg.buildNumber %> - ' + 
						'<%= grunt.template.today("isoDateTime") %> ' + 
						'\nCopyright 2017 <%= grunt.template.today("yyyy") %> wwwouaiebe ' + 
						'\nContact: http://www.ouaie.be/' + 
						'\nSources: <%= pkg.sources %> ' + 
						'\nLicense: <%= pkg.license %>\n*/\n\n',
					mangle: true,
					beautify: false
				},
				files: {
					'tmp/TravelNotesRoadbook.min.js': ['tmp/TravelNotesRoadbook.min.js']
				}
			}
		},
		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['index.html'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'dist/'
					},					
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.js'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'dist/'
					},
					{
						expand: true,
						cwd: 'src/cfg/',
						src: [ 'TravelNotesConfig.json', 'TravelNotesLayers.json' ],
						dest: 'dist/viewer/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'dist/viewer/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesViewer.html'],
						rename: function ( ){return 'dist/viewer/index.html';}
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.js'],
						dest: 'dist/viewer/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'dist/viewer/'
					}
				]
			},
			ghpage: {
				files: [
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['index.html'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'gh-page/'
					},					
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.js'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'gh-page/'
					},
					{
						expand: true,
						cwd: 'src/cfg/',
						src: [ 'TravelNotesConfig.json', 'TravelNotesLayers.json' ],
						dest: 'gh-page/viewer/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'gh-page/viewer/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: ['TravelNotesViewer.html'],
						rename: function ( ){return 'gh-page/viewer/index.html';}
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.js'],
						dest: 'gh-page/viewer/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'gh-page/viewer/'
					}
				]
			},
			debug: {
				files: [
					{
						expand: true,
						cwd: 'src/cfg/',
						src: ['*.json'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: 'indexDebug.html',
						rename: function ( ){return 'debug/index.html';}
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesRoadbook.html'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['**/*.js'],
						dest: 'debug/src/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotes.min.css'],
						dest: 'debug/'
					},
					{
						expand: true,
						cwd: 'src/cfg/',
						src: [ 'TravelNotesConfig.json', 'TravelNotesLayers.json' ],
						dest: 'debug/viewer/'
					},
					{
						expand: true,
						cwd: 'src/translations/',
						src: ['*.json'],
						dest: 'debug/viewer/'
					},
					{
						expand: true,
						cwd: 'src/html/',
						src: 'TravelNotesViewerDebug.html',
						rename: function ( ){return 'debug/viewer/index.html';}
					},
					{
						expand: true,
						cwd: 'src/',
						src: ['**/*.js'],
						dest: 'debug/viewer/src/'
					},
					{
						expand: true,
						cwd: 'tmp/',
						src: ['TravelNotesViewer.min.css'],
						dest: 'debug/viewer/'
					},
				]
			},
			TravelNotesGuides: {
				files: [
					{
						expand: true,
						cwd: 'TravelNotesGuides/',
						src: ['*.md'],
						dest: 'gh-page/TravelNotesGuides/'
					},
					{
						expand: true,
						cwd: 'TravelNotesGuides/en/',
						src: ['*.md', '*.png'],
						dest: 'gh-page/TravelNotesGuides/en/'
					},
					{
						expand: true,
						cwd: 'TravelNotesGuides/fr/',
						src: ['*.md', '*.png'],
						dest: 'gh-page/TravelNotesGuides/fr/'
					}
				]
			}
		},
		clean : ['tmp', 'src/polyline/Polyline.js' ]
	});
	grunt.config.data.pkg.buildNumber = grunt.file.readJSON('buildNumber.json').buildNumber;
	grunt.config.data.pkg.buildNumber = ("00000" + ( Number.parseInt ( grunt.config.data.pkg.buildNumber ) + 1 )).substr ( -5, 5 ) ;
	grunt.file.write ( 'buildNumber.json', '{ "buildNumber" : "' + grunt.config.data.pkg.buildNumber + '"}'  );
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-rollup');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-includes');
	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.registerTask('default', [ 'clean', 'eslint', 'includes:Polyline', 'rollup', 'cssmin', 'includes:Roadbook', 'copy:debug', 'clean' ]);
	grunt.registerTask('release', [ 'clean', 'eslint', 'includes:Polyline', 'rollup', 'uglify', 'cssmin', 'includes:Roadbook', 'copy:dist', 'copy:ghpage', 'copy:TravelNotesGuides', 'clean' ]);
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
	console.log ( '\n                                     ' + grunt.config.data.pkg.name + ' - ' + grunt.config.data.pkg.version +' - build: '+ grunt.config.data.pkg.buildNumber + ' - ' + grunt.template.today("isoDateTime") +'\n' );
	console.log ( '---------------------------------------------------------------------------------------------------------------------------------------------');
};