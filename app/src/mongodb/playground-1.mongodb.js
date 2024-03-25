/**
 * Project: mongodb
 * FilePath: /playground-1.mongodb.js
 * File: playground-1.mongodb.js
 * Created Date: Saturday, March 16th 2024, 9:07:01 pm
 * Author: Craig Bojko (craig@pixelventures.co.uk)
 * -----
 * Last Modified: Fri Mar 22 2024
 * Modified By: Craig Bojko
 * -----
 * Copyright (c) 2024 Pixel Ventures Ltd.
 * ------------------------------------
 */
/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/


/*
# Start a mongo container with the following environment variables:
docker run -d \
  --name=youtube-history-db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=youtube-history \
  -p 27017:27017 \
  mongo
*/

// Select the database to use.
use('youtube_history');

db.getCollection('history').aggregate(
  [
    {
      $match: {
        channel: {
          $regex: RegExp('Vevo'),
          $options: 'i'
        }
      }
    },
    {
      $group: {
        _id: '$name',
        video: { $first: '$$ROOT' },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        name: '$video.name',
        channel: '$video.channel',
        link: '$video.link',
        date: '$video.datetime',
        image: '$video.image',
        viewCount: '$count'
      }
    },
    { $sort: { viewCount: -1 } },
    { $limit: 100 }
  ],
  { maxTimeMS: 60000, allowDiskUse: true }
);
