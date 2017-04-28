/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const path = require('path');
const gulp = require('gulp');
const argv = require('yargs').argv;
const nodemon = require('gulp-nodemon');
const clean = require('./gulp-tasks/clean.js');

const buildElements = require('./gulp-tasks/build-elements');
const copyAssets = require('./gulp-tasks/copy-assets');
const copyBower = require('./gulp-tasks/copy-bower');
const runTests = require('./gulp-tasks/test');
const jsLinter = require('./gulp-tasks/js-linter');



global.config = {
  appName: 'etoolsTpm',
  polymerJsonPath: path.join(process.cwd(), 'polymer.json'),
  build: {
    rootDirectory: 'build',
    bundledDirectory: 'bundled',
    unbundledDirectory: 'unbundled',
    bundleType: 'bundled' // We will only be using a bundled build
  },
  // serviceWorkerPath: 'service-worker.js',
  // // Service Worker precache options based on
  // // https://github.com/GoogleChrome/sw-precache#options-parameter
  // swPrecacheConfig: {
  //   navigateFallback: '/index.html'
  // },
  sourceCodeDirectory: './src'
};

// Change global config if building into eTools
const etoolsBuild = require('./gulp-tasks/etoolsBuild.js');
if (argv._[0] === 'fullBuild') {
  etoolsBuild.config();
}

const project = require('./gulp-tasks/project.js');
const source = require('./gulp-tasks/project-source');
const dependencies = require('./gulp-tasks/project-dependencies');


gulp.task('watch', function () {
  gulp.watch(['./src/elements/**/*.*'], gulp.series(jsLinter, buildElements));
  gulp.watch(['./src/*.*', './src/assets/**/*.*'], gulp.series(copyAssets));
  gulp.watch(['./src/bower_components/**/*.*'], gulp.series(copyBower));
  gulp.watch(['./src/elements/**/*.spec.html'], gulp.series(runTests));
});

gulp.task('test', gulp.series(clean.build, gulp.parallel(buildElements, copyAssets, copyBower), runTests));
gulp.task('start', function () { nodemon({ script: 'server.js' }) });
gulp.task('build', gulp.series(clean.build, jsLinter, gulp.parallel(buildElements, copyAssets, copyBower)));



gulp.task('default', gulp.series([
  clean.build,
  project.merge(source, dependencies),
  // project.serviceWorker
]));

//Run dev server and watch changes
gulp.task('server', gulp.series(clean.build, jsLinter, gulp.parallel(buildElements, copyAssets, copyBower), gulp.parallel('start', 'watch')));


// DO NOT RUN
// Fully builds project
// Minifying, linting, and building into eTools
// TODO: This task is on hold
gulp.task('fullBuild', gulp.series([
  clean.fullBuild,
  project.merge(source, dependencies),
  project.serviceWorker,
  etoolsBuild.buildTemplate
]));
