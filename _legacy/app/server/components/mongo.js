
var Mongoose = require('mongoose')
var config = require('../../config/mongo.config')

var connection = false
var models = {}

function setupMongoInterface (modelRequest) {
  if (!connection) {
    Mongoose.Promise = global.Promise
    Mongoose.set('debug', true)
    // Mongoose.createConnection(config.db)
    Mongoose.connect(config.db)
    
    connection = true
    models = {
      ytHistory: require('./models/youtube_history.model')(Mongoose),
      ytMetadata: require('./models/youtube_metadata.model')(Mongoose)
    }
  }
  
  return models[modelRequest]
}

module.exports = setupMongoInterface
