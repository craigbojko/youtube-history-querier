
module.exports = function getVideoElements (html) {
  // JQuery setup for server
  var jsdom = require('jsdom')
  var jquery = require('jquery')
  global.document = jsdom.jsdom('<html></html>')
  global.window = document.defaultView
  global.$ = jquery(window)

  // Parsing function from here
  var videos = []
  var $dateBlocks = $(html).find('.fp-date-block-holder')

  $dateBlocks.each(function (index, element) {
    var $dateBlock = $(element)
    var $videoBlocks = $dateBlock.find('.fp-display-item-holder')
    $videoBlocks.each(function (index, videoElement) {
      var $video = $(videoElement)
      var nowYear = (new Date()).getFullYear()
      var date = $dateBlock.find('.fp-date-block h2').text().trim()
      var time = $video.find('div.fp-display-block-details span:first').text().trim()
      var dateTime = new Date(date + ' ' + nowYear + ' ' + time)
      var data = {
        title: $video.find('h4 > a').text().trim(),
        link: $video.find('h4 > a').attr('href').trim(),
        image: $video.find('img.fp-display-block-video-thumbnail').attr('src'),
        channel: $video.find('.fp-display-block-yt-channel').text().trim(),
        date: date,
        time: time,
        dateTime: dateTime.getTime()
      }
      videos.push(data)
    })
  })
  return JSON.stringify(videos)
}
