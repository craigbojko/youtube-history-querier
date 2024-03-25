
var request = require('request')
var queryString = require('querystring')
var config = require('../../../../config/google_credentials')

var API_KEY = config.ytKey
var params = {}
var URL = 'https://www.googleapis.com/youtube/v3/'

module.exports = {
  reqVideoMeta: reqVideoMeta
}

function reqVideoMeta (id) {
  params = {
    key: API_KEY,
    part: 'contentDetails,snippet',
    id: id
  }

  var compiledURL = URL + 'videos' + '?' + queryString.stringify(params)
  return requestVideoMeta(compiledURL)
}

function requestVideoMeta (url) {
  // console.log('QUERYING: %s', url)
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (error) {
        // console.log(error)
        reject(error)
      } else {
        var data = {}
        try {
          data = JSON.parse(body)
        } catch(e) {
          // console.log(e)
          data = {}
        }
        
        // console.log('STATUS CODE: %s', response.statusCode)
        if (response.statusCode === 200) {
          resolve(data)
        } else {
          // console.log(data.error)
          reject(data.error)
        }
      }
    })
  })
}

