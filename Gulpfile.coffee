gulp = require('gulp-param') require('gulp'), process.argv
jade = require 'gulp-jade'
data = require 'gulp-data'
less = require 'gulp-less'
coffee = require 'gulp-coffee'
plumber = require 'gulp-plumber'
browserSync = require('browser-sync').create()

# Jade
gulp.task 'jade', (game)->
	gulp.src 'app/*.jade'
		.pipe data -> data: require "./gamedata/#{game}.json"
		.pipe plumber()
		.pipe jade(pretty: true)
		.pipe gulp.dest('.tmp')
		.pipe browserSync.stream()

# CoffeeScript
gulp.task 'coffee', ->
	gulp.src 'app/scripts/*.coffee'
		.pipe plumber()
		.pipe coffee()
		.pipe gulp.dest('.tmp/scripts')
		.pipe browserSync.stream()

# LESS
gulp.task 'less', ->
	gulp.src 'app/stylesheets/*.less'
		.pipe plumber()
		.pipe less()
		.pipe gulp.dest('.tmp/stylesheets')
		.pipe browserSync.stream()

# Init server
gulp.task 'default', ['jade', 'coffee', 'less'], ->
	gulp.watch 'app/*.jade', ['jade']
	gulp.watch 'app/scripts/*.coffee', ['coffee']
	gulp.watch 'app/stylesheets/*.less', ['less']

	browserSync.init server:
		baseDir: ['app', '.tmp', 'node_modules']
