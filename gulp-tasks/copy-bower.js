'use strict';
var gulp = require('gulp');

function copyBower() {
    return gulp.src(['./src/bower_components/**/*'], {since: gulp.lastRun(copyBower)})
        .pipe(gulp.dest('./build/bower_components/'));
}

module.exports = copyBower;