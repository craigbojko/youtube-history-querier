
var fs = require('fs')
var parser = require('./parser')
var fname = 'activity_dump_' + (new Date().getTime()) + '.json'

module.exports = function runParsingRoutine (html) {
  console.log('SCRAPPING PAGE...')
  fs.writeFile(fname, parser(html), function (err, data) {
    if (err) {
      return console.log(err);
    }
    console.log('SCRAPPING COMPLETE.')
  })
}
