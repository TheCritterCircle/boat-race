var gulp = require('gulp'),
	plumber = require('gulp-plumber'),
	sourcemaps = require('gulp-sourcemaps'),
	concat = require('gulp-concat'),
	terser = require('gulp-terser'),
	browserSync = require('browser-sync').create();

function buildClient() {
	return gulp.src("src/**/*.js")
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(terser({
			warnings:"verbose"
		}))
		.pipe(concat('game.min.js'))
			.pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: '../src' }))
			.pipe(gulp.dest('client'))
}

gulp.task('build', buildClient);

gulp.task('server', function () {

	browserSync.init({
		server: ".",
		port: 8080
	});
	gulp.watch("src/**/*.js", buildClient);
	gulp.watch("client/game.min.js").on('change', browserSync.reload);
});