/* globals process */

require('colors')
var path = require('path')
var env = process.env.NODE_ENV || 'development'
var rootPath = path.normalize(__dirname + '/..')

console.log('SERVER RUNNING: YOUTUBE HISTORY QUERIER::'.green)
console.log('NODE ENV '.magenta, process.env.NODE_ENV)
console.log('ENV '.magenta, env)
console.log('ROOTPATH '.magenta, rootPath)

var config = {
  development: {
    root: rootPath,
    credentials: 'root:password',
    app: {
      name: 'youtube_history'
    },
    port: 5100,
    db: 'mongodb://localhost/youtube_history'
  },

  test: {
    root: rootPath,
    credentials: 'root:password',
    app: {
      name: 'youtube_history'
    },
    port: 5100,
    db: 'mongodb://localhost/youtube_history'
  },

  production: {
    root: rootPath,
    credentials: 'root:password',
    app: {
      name: 'youtube_history'
    },
    port: 5100,
    db: 'mongodb://localhost/youtube_history'
  }
}

module.exports = config[env]
