'use strict';

const gulp = require('gulp');
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');
const cp = require('child_process');
const browserSync = require('browser-sync');

const jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'bundle';

/*
 * Build the Jekyll Site
 * runs a child process in node that runs the jekyll commands
 */
gulp.task('jekyll-build', function (done) {
	cp.spawn(jekyllCommand, ['exec', 'jekyll', 'build'], {stdio: 'inherit'}).on('close', done);
});

/*
 * Rebuild Jekyll & reload browserSync
 */
gulp.task('jekyll-rebuild', gulp.series('jekyll-build', function (done) {
	browserSync.reload();
	done();
}));

/*
 * Build the jekyll site and launch browser-sync
 */
gulp.task('browser-sync', gulp.series('jekyll-build', function (done) {
	browserSync({
		server: {
			baseDir: '_site'
		}
	}, done);
}));

/*
* Compile and minify sass
*/
gulp.task('sass', function() {
	return gulp.src('src/styles/**/*.scss')
		.pipe(plumber())
		.pipe(sass())
		.pipe(csso())
		.pipe(gulp.dest('assets/css/'));
});

/*
* Compile fonts
*/
gulp.task('fonts', function() {
	return gulp.src('src/fonts/**/*.{ttf,woff,woff2}', {encoding: false})
		.pipe(plumber())
		.pipe(gulp.dest('assets/fonts/'));
})

/*
 * Minify images
 * gulp-imagemin@8 is ESM-only, so it is loaded with a dynamic import.
 */
gulp.task('imagemin', async function() {
	const imagemin = (await import('gulp-imagemin')).default;
	return gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'));
});

/**
 * Compile and minify js
 */
gulp.task('js', function(){
	return gulp.src('src/js/**/*.js')
		.pipe(plumber())
		.pipe(concat('main.js'))
		.pipe(uglify())
		.pipe(gulp.dest('assets/js/'))
});

gulp.task('watch', function(done) {
	gulp.watch('src/styles/**/*.scss', gulp.series('sass', 'jekyll-rebuild'));
	gulp.watch('src/js/**/*.js', gulp.series('js'));
	gulp.watch('src/fonts/**/*.{ttf,woff,woff2}', gulp.series('fonts'));
	gulp.watch('src/img/**/*.{jpg,png,gif}', gulp.series('imagemin'));
	gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], gulp.series('jekyll-rebuild'));
	done();
});

gulp.task('default', gulp.series('js', 'sass', 'fonts', 'browser-sync', 'watch'));
