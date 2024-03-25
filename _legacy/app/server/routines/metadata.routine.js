/*
* @Author: Craig
* @Date:   2016-11-24 10:15:55
* @Last Modified by:   Craig
* @Last Modified time: 2016-11-24 17:35:19
*/

require('colors')
var VideoMetadata = require('../components/metadata-ingest')
var VideoMetaReq = require('../components/modules/videoMetaReq')
var MissingMetadata = require('../components/queries/missingMetadata')

var MongoDB = require('../components/mongo')
var metadataCollection = MongoDB('ytMetadata')

var complete = false
var completePromise, completeResolve, completeReject
var count = 0
var finalIteration = false

var metadataSuccess = 0
var metadataUpdate = 0
var metadataFail = 0

module.exports = function () {
  return new Promise(promiseInit)
}

function promiseInit (resolve, reject) {
  if (resolve && reject && !completeResolve && !completeReject) {
    completeResolve = resolve
    completeReject = reject
  }

  if (!complete) {
    MissingMetadata.query().then(resultsResponse, resultsFail).then(promiseInit, resultsFail)
  } else {
    completeResolve({
      successfulInserts: metadataSuccess,
      successfulUpdates: metadataUpdate,
      failed: metadataFail,
    })
  }
}

function resultsResponse (results) {
  if ((results && results.length === 0) || finalIteration) {
    complete = true
    completeResolve({
      successfulInserts: metadataSuccess,
      successfulUpdates: metadataUpdate,
      failed: metadataFail,
    })
    return
  } else if (count === 50) {
    complete = true
    completeResolve({
      successfulInserts: metadataSuccess,
      successfulUpdates: metadataUpdate,
      failed: metadataFail,
    })
    return
  } else if (results && results.length === 1) {
    finalIteration = true
  }

  console.log('MONGO HISTORY RESULTS: %s'.cyan, results.length)
  return new Promise(function handleMissingMetaResponse (resolve, reject) {
    threadMetadataRequests(results).then(threadMetadataInsertion).then(function completeIteration () {
      console.log('REQUEST AND INSERT COMPLETE.'.cyan)
      count++
      resolve(true)
    }, function (err) {
      console.log(err)
    })
  })
}

function resultsFail (fail) {
  console.log(fail.red)
  completeReject(fail)
}

function threadMetadataRequests (results) {
  return new Promise(function runThreadMetadataRequestsPromise(resolve, reject) {
    var metaPromiseArr = []
    var responseArr = []

    for (var result in results) {
      var doc = results[result]
      metaPromiseArr.push(threadRequest(doc.videoId).then(function (response) {
        responseArr.push({
          resp: response,
          id: doc.videoId
        })
      }))
    }

    Promise.all(metaPromiseArr).then(function completeRequestIteration () {
      console.log('THREAD REQUESTS ALL COMPLETE: %s'.cyan, metaPromiseArr.length)
      resolve(responseArr)
    }, function (err) {
      console.log(err.red)
      reject(err)
    })
  })
}

function threadMetadataInsertion (responseMetadata) {
  return new Promise(function runThreadMetadataInsertionPromise (resolve, reject) {
    console.log('TO INSERT - RESPONSE SIZE: %s'.cyan, responseMetadata.length)
    var insertPromiseArr = []

    for (var result in responseMetadata) {
      var doc = responseMetadata[result].resp
      var id = responseMetadata[result].id
      insertPromiseArr.push(insertMetadataToMongo(id, doc))
    }

    Promise.all(insertPromiseArr).then(function completeRequestIteration () {
      console.log('INSERTS ALL COMPLETE: %s'.cyan, insertPromiseArr.length)
      resolve(true)
    }, function (err) {
      console.log(err.red)
      reject(err)
    })
  })
}

function threadRequest (videoId) {
  console.log('VIDEO ID: %s'.grey, videoId)
  return new Promise(function requestNewMeta (resolve, reject) {
    VideoMetaReq.reqVideoMeta(videoId).then(function handleNewMetaResponse (data) {
      if (data) {
        resolve(data)
      } else {
        resolve({
          error: 'No Data returned:1',
          msg: err
        })
      }
    }, function (err) {
      resolve({
        error: 'No Data returned:2',
        msg: err
      })
    })
  })
}

function insertMetadataToMongo (id, metadataObj) {
  return new Promise(function insertMetadataToMongoPromise (resolve, reject) {
    if (metadataObj.items && metadataObj.items[0]) {
      var metadata = metadataObj.items[0]
      metadataCollection.findOneAndUpdate({id: metadata.id}, metadata, {upsert: true}, function (err, doc) {
        if (err) {
          console.log('ERROR IN SAVING METADATA: %s :: '.red, metadata.id, err)
          metadataFail++
          reject(err)
        } else {
          if (doc) {
            metadataUpdate++
          } else {
            metadataSuccess++
          }
          resolve(doc)
        }
      })
    } else {
      var unavailableVideo = {
        id: id,
        kind: 'unavailableVideo'
      }
      metadataCollection.findOneAndUpdate({id: id}, unavailableVideo, {upsert: true}, function (err, doc) {
        if (err) {
          console.log('ERROR IN SAVING METADATA: %s :: '.red, id, err)
          metadataFail++
          reject(err)
        } else {
          if (doc) {
            metadataUpdate++
          } else {
            metadataSuccess++
          }
          resolve(doc)
        }
      })
    }
  })
}
