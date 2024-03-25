var sha1 = require('sha1')

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
      try {
        var $video = $(videoElement)
        var name = $video.find('h4 > a').text().trim()
        var link = $video.find('h4 > a').attr('href').trim()
        var videoId = link.match(/watch\?v=([A-z0-9-]+)/) && link.match(/watch\?v=([A-z0-9-]+)/).length && link.match(/watch\?v=([A-z0-9-]+)/)[1]

        var nowYear = (new Date()).getFullYear()
        var date = $dateBlock.find('.fp-date-block h2').text().trim()
        var time = $video.find('div.fp-display-block-details span:first').text().trim()
        var dateTime = new Date(date + ' ' + nowYear + ' ' + time)
        
        var data = {
          hash: sha1(dateTime.getTime().toString() + name + link),
          name: name,
          link: link,
          videoId: videoId,
          channel: $video.find('.fp-display-block-yt-channel').text().trim(),
          duration: $video.find('.fp-display-item-yt-duration').text().trim(),
          image: $video.find('img.fp-display-block-video-thumbnail').attr('src'),
          date: date,
          time: time,
          dateTime: dateTime.toISOString(),
          timestamp: dateTime.getTime()
        }
        videos.push(data)
      } catch (err) {
        console.log(err)
      }
    })
  })
  return videos
}
