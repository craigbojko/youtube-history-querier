
var Mongoose = require('mongoose')

var config = require('../../config/mongo.config')
var models = {}

function setupMongoInterface (modelRequest) {
  Mongoose.Promise = global.Promise
  Mongoose.set('debug', true)
  Mongoose.connect(config.db)

  models = {
    ytHistory: require('./models/youtube_history.model')(Mongoose)
  }

  return models[modelRequest]
}

module.exports = setupMongoInterface
