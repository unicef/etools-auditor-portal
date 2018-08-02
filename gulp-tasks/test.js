const spawn = require('child_process').spawn;
const argv = require('yargs').argv;
const fs = require('fs');

module.exports = function testElements(done) {
    let withErrors = false;
    let files = fs.readdirSync('./build/tests/');

    files = files.filter((src) => {
        return src.search(/index\d.spec.html/) !== -1;
    });

    runTests(files);

    function runTests() {
        let indexFileName = files.shift();

        if (!indexFileName) {
            testsEnded(withErrors);
            done();
            return;
        }

        let tests;
        if (argv.noxvfb) {
            tests = spawn('node', ['./node_modules/.bin/wct', '--skip-selenium-install', `./build/tests/${indexFileName}`], { stdio: 'inherit' });
        } else {
            tests = spawn('xvfb-run', ['-a', './node_modules/.bin/wct', '--skip-selenium-install', `./build/tests/${indexFileName}`], { stdio: 'inherit' });
        }

        console.log(`\x1b[32mRunning ${indexFileName}.\x1b[0m`);

        tests.on('close', () => {
            runTests(files);
        });
    }

    function testsEnded(withErrors) {
        if (withErrors) {
            console.log(`\x1b[31mTests failed! See above for more details.\x1b[0m`);
        } else {
            console.log('\x1b[32mTest run ended with great success.\x1b[0m')
        }

        if (withErrors && argv.pc) {
            process.exit(1);
        }
    }
};
