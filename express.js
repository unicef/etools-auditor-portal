const express = require('express'); // eslint-disable-line
const browserCapabilities = require('browser-capabilities'); // eslint-disable-line
const UAParser = require('ua-parser-js').UAParser; // eslint-disable-line

const app = express();
const basedir = __dirname + '/build/'; // eslint-disable-line

function getSourcesPath(request) {
  const userAgent = request.headers['user-agent'];
  const clientCapabilities = browserCapabilities.browserCapabilities(userAgent);
  const browserName = new UAParser(userAgent).getBrowser().name || '';
  // skip Edge because browser-capabilities library is outdated
  const needToUpgrade = !clientCapabilities.has('modules') && browserName !== 'Edge';
  return needToUpgrade ? `${basedir}esm-bundled/upgrade-browser.html` : `${basedir}esm-bundled/${filePath}`;
}

app.use('/ap/', (req, res, next) => {
  express.static(getSourcesPath(req))(req, res, next);
});

app.get(/.*service-worker\.js/, function(req, res) {
  res.sendFile(getSourcesPath(req) + 'service-worker.js');
});

app.use((req, res) => {
  // handles app access using a different state path than index (otherwise it will not return any file)
  res.sendFile(getSourcesPath(req) + 'index.html');
});

app.listen(8080);
