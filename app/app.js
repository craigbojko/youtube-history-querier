/*
* @Author: Craig
* @Date:   2016-11-11 12:24:16
* @Last Modified by:   Craig
* @Last Modified time: 2016-11-13 19:16:49
*/

var creds = require('../config/google_credentials')
var Activity = require('./server/components/myactivity-ingest')
var MongoDB = require('./server/components/mongo')
var writeToFile = false

var countSuccess = 0
var countUpdate = 0
var countFail = 0

var historyCollection = MongoDB('ytHistory')
runSpookyScraping()

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
  
  data.forEach(function (activityObj, index, dataArr) {
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

function testQuery () {
  var MongoCollection = MongoDB('ytHistory')
  MongoCollection.find({
    'name': new RegExp('evanescence.*lithium', "i")
  }).exec(function (err, doc) {
    if (err) {
      console.error(err)
    } else {
      console.log(doc)
    }
    process.exit()
  })
}
