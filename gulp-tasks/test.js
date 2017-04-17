const spawn = require('child_process').spawn;

module.exports = function testElements(done) {
    let tests = spawn('npm', ['test']);

    tests.stdout.on('data', (data) => {
        if (~data.indexOf('Error')) data = `\x1b[31m${data}\x1b[0m`;
        else if (~data.indexOf('ended with great success')) data = `\x1b[32m${data}\x1b[0m`;
        console.log(`${data}`);
    });

    tests.stderr.on('data', (data) => {
        console.log(`${data}`);
    });

    tests.on('close', (code) => {
        done();
    });
};