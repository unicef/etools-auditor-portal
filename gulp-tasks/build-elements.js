'use strict';

const gulp = require('gulp'),
    compileHtmlTags = require('gulp-compile-html-tags'),
    sass = require('gulp-sass'),
    babel = require("gulp-babel"),
    builder = require('polytempl'),
    gulpIf = require('gulp-if'),
    combine = require('stream-combiner2').obj,
    through2 = require('through2').obj,
    path = require('path'),
    inject = require('gulp-inject-string');



function buildElements(done) {
    let testSources = [];

    gulp.src(['./src/elements/**/*.html'])
        .pipe(gulpIf(
            function(file) {
                return ~file.basename.indexOf('.spec.html');
            },
            // move test files into /tests folder
            through2(function(file, enc, callback){
                file.base = path.normalize(file.base + '..');
                file.path = `${file.base}/tests/${file.basename}`;

                testSources.push(file.basename);
                testSources.push(`${file.basename}?dom=shadow`);
                callback(null, file);
            })
        ))
        // combine html/js/scss
        .pipe(builder([`${process.cwd()}/src/bower_components/`]))
        // compile html/js/scss
        .pipe(gulpIf(
            function(file) {
                return !~file.basename.indexOf('.spec.html');
            },
            combine(
                compileHtmlTags('style', function (tag, data) {
                    return data.pipe(sass().on('error', function(error) {console.log('\x1b[31m%s\x1b[0m', error.message); done()}))
                }),
                compileHtmlTags('script', function (tag, data) {
                    return data.pipe(babel({
                        presets: ['es2015']
                    }).on('error', function(error) {console.log('\x1b[31m%s\x1b[0m', error.message); done()}));
                }),
                through2(function(file, enc, callback){
                    file.base = path.normalize(file.base + '..');
                    callback(null, file);
                })
            )
        ))
        .pipe(gulp.dest('./build/'))
        .on('end', function () {
            // add test sources to index.spec.html and move file to the build folder
            gulp.src('./src/tests/index.spec.html')
                .pipe(inject.replace('<!--testSources-->', `"${testSources.join('", "')}"`))
                .pipe(gulp.dest('./build/tests/'));

            done();
        });
}

module.exports = buildElements;