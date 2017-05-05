const spawn = require('child_process').spawn;
const argv = require('yargs').argv;

module.exports = function testElements(done) {
    let tests = spawn('npm', ['test']);

    tests.stdout.on('data', (data) => {
        if (~data.indexOf('Error')) data = `\x1b[31m${data}\x1b[0m`;
        else if (~data.indexOf('ended with great success')) data = `\x1b[32m${data}\x1b[0m`;
        console.log(`${data}`);
    });

    tests.stderr.on('data', (data) => {
        if (!argv.pc) {
            console.log(`${data}`);
        } else {
            process.exit(1);
        }
    });

    tests.on('close', (code) => {
        done();
    });
};
