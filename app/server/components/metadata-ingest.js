
var VideoMeta = require('./modules/videoMetaReq')

module.exports = {
  getSingleVideoMeta: getSingleVideoMeta
}

function getSingleVideoMeta (id, callback) {
  VideoMeta.reqVideoMeta(id, function (err, data) {
    if (err) {
      console.error(err)
      return
    }

    var content = data.items && data.items.length && data.items[0]
    callback(content)
  })
}
