/*
* @Author: Craig
* @Date:   2016-11-11 12:05:06
* @Last Modified by:   Craig Bojko
* @Last Modified time: 2017-09-07 12:30:59
*/

var spooky
var Spooky = require('spooky')
var runParsingRoutine = require('./modules/parserRoutine')
var emailCredentials
var passwordCredentials
var callback, writeToFile

module.exports = function (credentials, _writeToFile, _callback) {
  emailCredentials = {'#Email': credentials.username}
  passwordCredentials = {'#Passwd': credentials.password}
  callback = _callback
  writeToFile = _writeToFile
  return runSpookyScript()
}

var spookyOptions = {
  child: {
    transport: "http",
    'cookies-file': 'cookies.txt'
  },
  casper: {
    waitTimeout: 180000, // 3 mins
    verbose: true,
    logLevel: "info", // debug, info, warning, error
    pageSettings: {
      loadImages: false,
      loadPlugins: false,
      userAgent:
        "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0 Safari/537.36"
    },
    viewportSize: { width: 1200, height: 960 }
  }
};

/**
 * MAIN - init function
 */
function runSpookyScript () {
  spooky = (new Spooky(spookyOptions, spookyCallback))
    .on('error', _error)
    .on('console', _log)
    .on('htmlResponse', _continue)
    .on('parsingComplete', callback)
}

function spookyCallback (err) {
  if (err) {
    e = new Error('Failed to initialize SpookyJS')
    e.details = err
    throw e
  }

  spooky.start('https://accounts.google.com/Login?continue=https://myactivity.google.com/item%3Fproduct%3D26&hl=en-GB&nojavascript=1#identifier')
  spooky.then([{
    emailCredentials: emailCredentials,
    passwordCredentials: passwordCredentials
  }, login])
  spooky.then(scrape)
  spooky.run()
}

function _continue (data) {
  console.log('HTML RESPONSE ACHIEVED.')
  runParsingRoutine(data, writeToFile, callback)
}

function _log (line) {
  console.log(line)
}

function _error (e, stack) {
  console.error(e)
  if (stack) {
    console.log(stack)
  }
}

function login () {
  this.capture('1.png')
  this.waitForSelector("form", function fillEmailForm() {
    console.log("LOGIN: Then proceeding");
    this.fillSelectors("form", emailCredentials, false).click("#next");
    this.waitForSelector("input#Passwd").then(
      function fillPasswordAndSubmit() {
        this.fillSelectors("form", passwordCredentials, false).click(
          'input[type="submit"]'
        );
      }
    );
  }, function alreadyLoggedIn() {
    console.log("LOGIN: Already logged in.");
    return
  }, 5000);
}

function scrape () {
  this
    .waitForUrl(/item\?product=26/)
    .waitForSelector('div.fp-display-item-holder')
    .then(function () {
      this.emit('htmlResponse', this.page.evaluate(function returnDocumentElements () {
        return window.document.documentElement.innerHTML
      }))
    })
    .run(function () {
      this.exit()
    })
}
