/*
* @Author: Craig
* @Date:   2016-11-11 12:05:06
* @Last Modified by:   Craig
* @Last Modified time: 2016-11-11 12:05:27
*/

var spooky
var Spooky = require('spooky')
var runParsingRoutine = require('./js/parserRoutine')
var creds = require('../config/google_credentials.js')

var emailCredentials = {'#Email': creds.username}
var passwordCredentials = {'#Passwd': creds.password}
var spookyOptions = {
  child: {
    transport: 'http'
  },
  casper: {
    waitTimeout: 20000,
    verbose: true,
    logLevel: 'debug', // debug, info, warning, error
    pageSettings: {
      loadImages: false,
      loadPlugins: false,
      userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0 Safari/537.36'
    },
    viewportSize: {width: 1200, height: 960}
  }
}

/**
 * MAIN - init function
 */
runSpookyScript()
function runSpookyScript () {
  spooky = (new Spooky(spookyOptions, spookyCallback))
    .on('error', _error)
    .on('console', _log)
    .on('htmlresponse', _continue)
}

function spookyCallback (err) {
  if (err) {
    e = new Error('Failed to initialize SpookyJS')
    e.details = err
    throw e
  }

  spooky.start('https://accounts.google.com/Login?continue=https://myactivity.google.com/item%3Fproduct%3D26&hl=en-GB#identifier')
  spooky.then([{
    emailCredentials: emailCredentials,
    passwordCredentials: passwordCredentials
  }, login])
  spooky.then(scrape)
  spooky.run()
}

function _continue (data) {
  console.log('HTML RESPONSE ACHIEVED.')
  runParsingRoutine(data)
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
  this.waitForSelector("form").then(function fillEmailForm () {
    this.fillSelectors('form', emailCredentials, false).click('#next')
    this.waitForSelector("input#Passwd").then(function fillPasswordAndSubmit () {
      this.fillSelectors('form', passwordCredentials, false).click('input[type="submit"]')
    })
  })
}

function scrape () {
  this
    .waitForUrl(/item\?product=26/)
    .waitForSelector('div.fp-display-item-holder')
    .then(function () {
      this.emit('htmlresponse', this.page.evaluate(function returnDocumentElements () {
        return window.document.documentElement.innerHTML
      }))
    })
    .run(function () {
      this.exit()
    })
}
