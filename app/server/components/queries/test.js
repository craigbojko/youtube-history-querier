module.exports = {
  query: test
}

/**
 * Test query
 * @return {Promise} resolves with results array
 */
function test () {
  var MongoDB = require('../mongo')
  var MongoCollection = MongoDB('ytHistory')

  var query = MongoCollection.find({
    'name': new RegExp('evanescence.*lithium', "i")
  })

  return new Promise(function (resolve, reject) {
    query.exec(function (err, results) {
      if (err) {
        console.error(err)
        reject(err)
      } else {
        console.log(results)
        resolve(results)
      }
    })
  })

}
