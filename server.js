var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');

var ROOT = __dirname + "/build";

http.createServer(function(req, res) {
    sendFileSafe(url.parse(req.url).pathname, res);
}).listen(8080);

function sendFileSafe(filePath, res) {
    try {
        filePath = decodeURIComponent(filePath);
    } catch (e) {
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }

    if (~filePath.indexOf('\0')) {
        res.statusCode = 400;
        res.end("Bad Request");
        return;
    }

    if (filePath.indexOf('.') < 0) {
        filePath = '/index.html';
    }
    if (filePath.indexOf('/tpm') === 0) {
        filePath = filePath.slice(4);
    }

    filePath = path.normalize(path.join(ROOT, filePath));

    fs.stat(filePath, function(err, stats) {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            fs.readFile(path.normalize(path.join(ROOT, '/error-404.html')), function(err, content) {
                res.end(content)
            });
            return;
        }

        sendFile(filePath, res);
    });
}

function sendFile(filePath, res) {
    var file = new fs.ReadStream(filePath);

    var mime = require('mime').lookup(filePath);
    res.setHeader('Content-Type', mime + "; charset=utf-8");

    file.pipe(res);

    file.on('error', function(err) {
        res.end('Server Error');
        console.error(err);
    });

    res.on('close', function() {
        file.destroy();
    });
}

console.log("Server is listening!");