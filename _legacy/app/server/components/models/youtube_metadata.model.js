
module.exports = function (mongoose) {
  var Schema = mongoose.Schema
  // var ObjectId = Schema.ObjectId

  var metadataSchema = new Schema({
    kind: String,
    etag: String,
    id: String,
    snippet: Schema.Types.Mixed,
    contentDetails: Schema.Types.Mixed
  })

  return mongoose.model('ytMetadata', metadataSchema, 'metadata')
}
