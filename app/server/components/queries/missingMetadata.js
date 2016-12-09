/*
* @Author: Craig
* @Date:   2016-11-23 16:30:56
* @Last Modified by:   Craig
* @Last Modified time: 2016-11-24 15:01:46
*/

module.exports = {
  query: queryMissingMetadata
}

/**
 * Queries Mongodb for history items that have no relevant metadata
 * @return {Promise} resolves with results array
 */
function queryMissingMetadata () {
  var MongoDB = require('../mongo')
  var historyCollection = MongoDB('ytHistory')
  var missingMetaQuery = historyCollection.aggregate([{
  //   $limit: 50
  // }, {
    $match: {
      'videoId': {$not: /searchquery/}
    }
  }, {
    $lookup: {
      from:'metadata',
      localField:'videoId',
      foreignField:'id',
      as:'metadata'
    }
  }, {
    $match: {
      'metadata': {
        $lt: [
          'metadata', null
        ]
      }
    }
  }, {
    $limit: 10
  }])

  return new Promise(function (resolve, reject) {
    missingMetaQuery.exec(function (err, results) {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })

}