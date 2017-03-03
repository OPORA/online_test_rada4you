var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var minify = require('gulp-minify');
var rename = require("gulp-rename");

gulp.task('minify-css', function() {
    return gulp.src('lib/css/*.css')
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('public/css'));
            
});
gulp.task('compress', function() {
    gulp.src('lib/js/*.js')
        .pipe(minify({
            ext:{
                src:'-debug.js',
                min:'.min.js'
            },
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '-min.js'],
            preserveComments: 'some'
        }))
        .pipe(gulp.dest('public/js'))
});