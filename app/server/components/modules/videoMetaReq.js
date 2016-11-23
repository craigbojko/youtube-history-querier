
var request = require('request')
var queryString = require('querystring')
var config = require('../../../../config/google_credentials')

var API_KEY = config.ytKey
var params = {}
var URL = 'https://www.googleapis.com/youtube/v3/'

module.exports = {
  reqVideoMeta: reqVideoMeta
}

function reqVideoMeta (id, callback) {
  params = {
    key: API_KEY,
    part: 'contentDetails,snippet',
    id: id
  }

  var compiledURL = URL + 'videos' + '?' + queryString.stringify(params)  
  requestVideoMeta(compiledURL, callback)
}

function requestVideoMeta (url, callback) {
  request(url, function (error, response, body) {
    if (error) {
      callback(error)
    } else {
      var data = {}
      try {
        data = JSON.parse(body)
      } catch(e) {
        data = {}
      }
      
      if (response.statusCode == 200) {
        callback(null, data)
      } else {
        callback(data.error)
      }
    }
  })
}

