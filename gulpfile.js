var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename');
var concat = require('gulp-concat');
const terser = require('gulp-terser');


gulp.task('scripts', function(){
	return gulp.src("src/**/*.js")
	.pipe(plumber({
		errorHandler: function (error) {
		  console.log(error.message);
		  this.emit('end');
	  }}))
 .pipe(concat('game.min.js'))
  //.pipe(gulp.dest('client'))
  //.pipe(rename({suffix: '.min'}))
  .pipe(terser())
  .pipe(gulp.dest('client'))
});

gulp.task('default', function(){
  gulp.watch("src/**/*.js", ['scripts']);
});