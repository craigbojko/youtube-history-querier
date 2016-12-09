
// get all videos without metadata (exclude queries)
db.getCollection('history').aggregate([{$match: {'videoId': {$not: /searchquery/}}}, {$lookup: {from:'metadata',localField:'videoId',foreignField:'id',as:'metadata'}}, {$match: {'metadata': {$lt: ['metadata', null]}}}])

// get 10 videos with their metadata
db.getCollection('history').aggregate([{$limit: 10}, {$lookup: {from:'metadata',localField:'videoId',foreignField:'id',as:'metadata'}}])

// get video with id and its metadata
db.getCollection('history').aggregate([{$match: {videoId: 'ogMNV33AhCY'}}, {$lookup: {from:'metadata',localField:'videoId',foreignField:'id',as:'metadata'}}])

// get video by name
db.getCollection('history').find({name: 'Pendulum - Witchcraft (Official Video)'})

// get video by name regex
db.getCollection('history').find({name: /Pendulum/})
