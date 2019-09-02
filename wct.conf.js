module.exports = {
  plugins: {
    "local": {
      "disabled": false,
      "browsers": [{
          "browserName": "firefox"
        }
      ],
      browserOptions: {
        firefox: [
          "http://localhost:8081/components/tpm/generated-index.html?cli_browser_id=0",
          "--headless"
        ]
      }
    }
  }
};