const gulp = require('gulp');

const browserify = require('gulp-browserify');
const babel = require('gulp-babel');
const connect = require('gulp-connect');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const gulpIf = require("gulp-if");
const autoprefixer = require("gulp-autoprefixer");


var isDev = !(process.env.DEV == 'production');
var path = {
	root: './',
	build: {
		js: 'dist',
		css: 'dist/css',
		img: 'dist/img'
	},
	src: {
		js: 'src/js/app.js',
		css: 'src/css/*.css',
		img: 'src/img/**/*.*'
	},
	watch: {
		js: 'src/js/**/*.js',
		css: 'src/css/**/*.css',
		img: 'src/img/**/*.*'
	}
};

var errorMessage = () => {
	return plumber({errorHandler: notify.onError((err) => {
		return {
			title: err.name,
			message: err.message
		}
	})})
}


// server
gulp.task('server', () => {
	return connect.server({
		port: 1338,
		livereload: true,
		root: path.root
	});
});

// JavaScript, using Babel and uglifyJS
gulp.task('js', () => {
	return gulp.src(path.src.js)
		.pipe(errorMessage())
		.pipe(browserify({
			debug: isDev
		}))
		.pipe(
			gulpIf(!isDev, 
				babel({
					presets: ['es2015']
				})
			)
		)
		.pipe(gulpIf(!isDev, uglify()))
		.pipe(gulp.dest(path.build.js))
		.pipe(connect.reload());
});

// images min
gulp.task('images', function () {
	gulp.src(path.src.img)
		.pipe(errorMessage())
		.pipe(imagemin())
		.pipe(gulp.dest(path.build.img))
		.pipe(connect.reload());
});
gulp.task('css', function () {
	gulp.src(path.src.css)
		.pipe(errorMessage())
		.pipe(autoprefixer())
		.pipe(gulp.dest(path.build.css))
		.pipe(connect.reload());
});

// Watch files
gulp.task('watch', function() {
	gulp.watch(path.watch.js, ['js']);
	gulp.watch(path.watch.img, ['images']);
	gulp.watch(path.watch.css, ['css']);
});

// Tasks
gulp.task('default', ['js', 'css', 'images', 'server', 'watch']);