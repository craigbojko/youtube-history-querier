var Youtube = require('youtube-api')
var fs = require('fs')
var Lien = require('lien')
var Logger = require('bug-killer')
var opn = require('opn')

var config = require('./config/config')
var _token
var dataBuffer = []

// Init lien server
var server = new Lien({
  host: 'localhost',
  port: 9000
})

server.on('load', err => {
  console.log(err || 'Server started on port 9000.')
  err && process.exit(1)
})

server.addPage('/', lien => {
  lien.end('Hello World')
})

server.on('serverError', err => {
  console.log(err.stack)
})

var oauth = Youtube.authenticate({
  type: 'oauth',
  // refresh_token: 'your refresh token',
  client_id: config.clientId,
  client_secret: config.clientSecret,
  redirect_url: 'http://localhost:9000/oauth2callback'
})
// var oauth = Youtube.authenticate({
//   type: 'oauth',
//   token: config.token
// })

server.addPage('/oauth2callback', function (lien) {
  Logger.log('Trying to get the token using the following code: ' + lien.query.code)
  oauth.getToken(lien.query.code, function (err, tokens) {
    if (err) {
      lien.lien(err, 400)
      return Logger.log(err)
    }
    Logger.log('Got the tokens.')
    fs.writeFile('.youtubeToken', JSON.stringify(tokens), 'utf8', function () {
      Logger.log('TOKEN WRITTEN')
      console.log(tokens)
    })
    oauth.setCredentials(tokens)
    _token = tokens
    getData(lien)
  })
})

var count = 0
function getData (lien, page) {
  if (count >= 1) {
    console.log('DONE')
    lien.end(JSON.stringify(dataBuffer))
    process.exit();
  }
  if (!page) {
    count++
    Youtube.playlistItems.list({
      part: "snippet,status",
      playlistId: 'HLrPnpeFRBDXagnQRM8YOkrQ',
      publishedBefore: '2015-01-01',
      maxResults: 50
    }, (err, data) => {
      if (err) {
        console.error(err)
        lien.end(JSON.stringify(dataBuffer))
        process.exit();
      } else {
        console.log('COUNT: %s', count)
        dataBuffer.push(data)
        if (data.nextPageToken) {
          console.log('GETTING NEXT PAGE: %s', data.nextPageToken)
          getData(lien, data.nextPageToken)
        }
      }
    })
  } else {
    count++
    Youtube.playlistItems.list({
      part: "snippet,status",
      playlistId: 'HLrPnpeFRBDXagnQRM8YOkrQ',
      publishedBefore: '2015-01-01',
      pageToken: page,
      maxResults: 50
    }, (err, data) => {
      if (err) {
        console.error(err)
        lien.end(JSON.stringify(dataBuffer))
        process.exit();
      } else {
        console.log('COUNT: %s', count)
        dataBuffer.push(data)
        if (data.nextPageToken) {
          getData(lien, data.nextPageToken)
        }
      }
    })
  }
}

opn(oauth.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/youtube']
}))
