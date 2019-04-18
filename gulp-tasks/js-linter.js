'use strict';

const gulp = require('gulp');
// const jshint = require('gulp-jshint');
// const jscs = require('gulp-jscs');
const through2 = require('through2').obj;
const fs = require('fs');
// const gulpIf = require('gulp-if');
const combine = require('stream-combiner2').obj;
// const argv = require('yargs').argv;
const eslint = require('gulp-eslint');


function lint() {

  return gulp.src('./src/elements/**/*.js', { read: false })
      .pipe(
          combine(
              through2(function(file, enc, callback) {
                file.contents = fs.readFileSync(file.path);
                callback(null, file);
              }),
              eslint({ fix: true }),
              eslint.format(),
              eslint.failOnError()
          )
      )
      .pipe(eslint.results((results) => {
        // Called once for all ESLint results.
        console.log(`Total Results: ${results.length}`);
        console.log(`Total Warnings: ${results.warningCount}`);
        console.log(`Total Errors: ${results.errorCount}`);
      }))
      .on('end', function() {
        if (!fs.existsSync('build')) {
          fs.mkdirSync('build');
        }
        // fs.writeFileSync(cacheFilePath, JSON.stringify(eslintResults));
      });
}

module.exports = lint;
