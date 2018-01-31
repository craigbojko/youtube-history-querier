/*
* @Author: Craig
* @Date:   2016-11-11 12:24:16
* @Last Modified by:   Craig Bojko
* @Last Modified time: 2017-09-30 16:09:15
*/

require('colors')
var creds = require('../config/google_credentials')
var Activity = require('./server/components/myactivity-ingest')
var VideoMetaData = require('./server/components/metadata-ingest')
var MongoDB = require('./server/components/mongo')
var writeToFile = false

var countSuccess = 0
var countUpdate = 0
var countFail = 0

var historyCollection = MongoDB('ytHistory')
var metadataCollection = MongoDB('ytMetadata')
runSpookyScraping()
// runMetadataRequests('FOlPXtXTSXc')
// var MetadataRoutine = require('./server/routines/metadata.routine')
// MetadataRoutine().then(function (res) {
//   console.log('ROUTINE COMPLETE.'.green)
//   console.log(JSON.stringify(res).green)
//   process.exit()
// })

/**
 * Initialises SpookyJS for myactivity page parsing
 * @return  [array] - JSON array of Youtube interaction objects scraped from page
 */
function runSpookyScraping () {
  Activity(creds, writeToFile, scrapingComplete)
}

function scrapingComplete (ytData) {
  console.log('SPOOKYJS DONE. ITEMS: %s', ytData.length)
  setTimeout(function () {
    analyseData(ytData)
  }, 1000)
}

function analyseData (data) {
  var promiseArr = []
  var monthMap = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  data.forEach(function (activityObj, index, dataArr) {
    if (activityObj && activityObj.date && ~activityObj.date.toLowerCase().indexOf('yesterday')) {
      var now = new Date().getTime()
      var yesterday = new Date(now - 86400000)
      activityObj.date = '' + monthMap[yesterday.getMonth()] + ' ' + yesterday.getDate()
      console.log('CONVERTING Yesterday to %s', activityObj.date)
    }
    promiseArr.push(insertToMongo(activityObj, index, dataArr))
  })

  Promise.all(promiseArr).then(function () {
    console.log('ALL ACTIVITY PERSISTED: SUCCESS: %s UPDATE: %s FAIL: %s', countSuccess, countUpdate, countFail)
    process.exit()
  })
}

function insertToMongo (activityObj, index, dataArr) {
  return new Promise(function (resolve, reject) {
    historyCollection.findOneAndUpdate({hash: activityObj.hash}, activityObj, {upsert: true}, function (err, doc) {
      if (err) {
        console.error('ERROR IN SAVING ACTIVITY: %s :: ', activityObj.hash, err)
        countFail++
        reject(err)
      } else {
        if (doc) {
          countUpdate++
          // console.log('UPDATE: %s', countUpdate)
        } else {
          countSuccess++
          // console.log('SUCCESS: %s', countSuccess)
        }
        resolve(doc)
      }
    })
  })
}

