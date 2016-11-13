
var fs = require('fs')
var parser = require('./parser')
var fname = 'activity_dump_' + (new Date().getTime()) + '.json'

module.exports = function runParsingRoutine (html, writeToFile, callback) {
  console.log('SCRAPPING PAGE...')
  var parsed = parser(html)

  if (writeToFile === true) {
    fs.writeFile(fname, JSON.stringify(parsed), function (err, data) {
      if (err) {
        return console.log(err);
      }
      callback(parsed)
      console.log('SCRAPPING COMPLETE... WRITTEN TO FILE: %s.', fname)
    })
  } else {
    callback(parsed)
  }
}
