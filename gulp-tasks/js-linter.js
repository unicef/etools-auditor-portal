const gulp = require('gulp');
const jscs = require('gulp-jscs');
const jshint = require('gulp-jshint');

function lint() {
    return gulp.src('./src/elements/**/*.js', {since: gulp.lastRun(lint)})
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
}

module.exports = lint;