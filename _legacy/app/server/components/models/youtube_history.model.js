
module.exports = function (mongoose) {
  var Schema = mongoose.Schema
  // var ObjectId = Schema.ObjectId

  var historySchema = new Schema({
    hash: String,
    name: String,
    link: String,
    channel: String,
    duration: String,
    image: String,
    date: String,
    time: String,
    dateTime: String,
    timestamp: String
  })

  return mongoose.model('ytHistory', historySchema, 'history')
}
