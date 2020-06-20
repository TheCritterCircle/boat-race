var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	terser = require('gulp-terser');


gulp.task('scripts', function(){
	return gulp.src("src/**/*.js")
	.pipe(sourcemaps.init())
	.pipe(plumber({
		errorHandler: function (error) {
		  console.log(error.message);
		  this.emit('end');
	  }}))
 .pipe(concat('game.min.js'))
  //.pipe(gulp.dest('client'))
  //.pipe(rename({suffix: '.min'}))
  .pipe(terser())
  .pipe(sourcemaps.write('.',{includeContent: false, sourceRoot: '../src'}))
  .pipe(gulp.dest('client'))
});

gulp.task('default', function(){
  gulp.watch("src/**/*.js", ['scripts']);
});