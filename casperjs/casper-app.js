// casperjs --config=config.json ontrees.casper.js

var fs = require('fs')

var Casper = require('casper')
var creds = require('../config/google_credentials.js')

var casper
var fname = 'activity_dump_' + (new Date().getTime()) + '.json'

var emailCredentials = {'#Email': creds.username}
var passwordCredentials = {'#Passwd': creds.password}

function getVideoElements (html) {
  var $ = require('jquery')
  var videos = []
  var $dateBlocks = $(html).find('.fp-date-block-holder')
  
  $dateBlocks.each(function (index, element) {
    var $dateBlock = $(element)
    var $videoBlocks = $dateBlock.find('.fp-display-item-holder')
    $videoBlocks.each(function (index, videoElement) {
      var $video = $(videoElement)
      var nowYear = (new Date()).getFullYear()
      var date = $dateBlock.find('.fp-date-block h2').text().trim()
      var time = $video.find('div.fp-display-block-details span:first').text().trim()
      var dateTime = new Date(date + ' ' + nowYear + ' ' + time)
      var data = {
        title: $video.find('h4 > a').text().trim(),
        link: $video.find('h4 > a').attr('href').trim(),
        image: $video.find('img.fp-display-block-video-thumbnail').attr('src'),
        channel: $video.find('.fp-display-block-yt-channel').text().trim(),
        date: date,
        time: time,
        dateTime: dateTime.getTime()
      }
      videos.push(data)
    })
  })
  return JSON.stringify(videos)
}

function runParsingRoutine () {
  // casper.capture('login-final.png')
  // console.log("Injecting...")
  // casper.page.includeJs("https://code.jquery.com/jquery-3.1.1.min.js", function() {
    // console.log("INJECTED!!!")
    console.log('SCRAPPING PAGE...')
    var htmlobjects = casper.page.evaluate(function returnDocumentElements () {
      return window.document.documentElement.innerHTML
    })

    var objects = getVideoElements(htmlobjects)
    fs.write(fname, objects, 'w')
    // console.log('OBJECTS:::', objects);
    console.log('SCRAPPING COMPLETE.')
  // })
  // casper.then(function finish () {
  //   console.log('DONE... waiting for scrape...')
  // })
}

casper = Casper.create({
  waitTimeout: 20000,
  verbose: true,
  logLevel: 'debug',
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0 Safari/537.36'
  },
  viewportSize: {width: 1200, height: 960}
}).on('resource.error', function (resourceError) {
  console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')')
  console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString)
})

casper.start().then(function openLoginPage () {
  this.open('https://accounts.google.com/Login?continue=https://myactivity.google.com/myactivity%3Fproduct%3D26&hl=en-GB#identifier', {
    method: 'get',
    headers: {
      'Accept': 'text/html'
    }
  })
})

casper.waitForSelector("form").then(function fillEmailForm () {
  this.fillSelectors('form', emailCredentials, false).click('#next')
  this.waitForSelector("input#Passwd").then(function fillPasswordAndSubmit () {
    this.fillSelectors('form', passwordCredentials, false).click('input[type="submit"]')
  })
})

casper
  .waitForUrl(/myactivity\?product=26/)
  .waitForSelector('div.layout-row.flex')
  .thenOpen('https://myactivity.google.com/item?product=26')
  .waitForSelector('div.fp-display-item-holder')
  .then(runParsingRoutine)
  .run(function () {
    this.exit()
  })
