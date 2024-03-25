/*
* @Author: Craig
* @Date:   2016-11-23 16:30:48
* @Last Modified by:   Craig
* @Last Modified time: 2016-11-23 16:33:42
*/

module.exports = {
  query: querySingleId
}

/**
 * Queries Mongodb for history item with metadata (full result)
 * @return {Promise} resolves with result object
 */
function querySingleId (id) {
  var MongoDB = require('../mongo')
  var historyCollection = MongoDB('ytHistory')
  var singleId = historyCollection.aggregate([{
    $match: {
      videoId: id
    }
  }, {
    $lookup: {
      from: 'metadata',
      localField: 'videoId',
      foreignField: 'id',
      as: 'metadata'
    }
  }])

  return new Promise(function (resolve, reject) {
    singleId.exec(function (err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
  })

}