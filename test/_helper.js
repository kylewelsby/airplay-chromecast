var fs = require('fs')
var path = require('path')
var daap = require('node-daap')
var Chromeserver = require('castv2').Server

var rtpmethods = {}
rtpmethods.announce = function () {
  var rsaAesKey = 'ldAdTcI8b2okzDhz3bCnFPwwMVwwGCVt8+0bqURzomwUVWh5gwuee14E8FszGvrJvl5+3lfXMMDw3MRTO4arG380WNq3hl7H+ck' +
    'wgID2ZiV3YgSwh/oVA5QieD65m5vtYyNqe1dypQHOE0Fz/fOXb5ySpmzVvbJbMKP7H7DucpoXTWvk9CHMLZU8z9vWUVxMi862FPNLFWfrCE9NBM' +
    'bwFk2r40QdbYC5fd+6d/ynrDLit6V5T/l8ESi6tcC4vRFrM8j2gQkGwLilpbKL+k38rBvZK+zTs8k/k25zOb7xtfrKoWJ7soIska+unVnEF5ILE' +
    'XyE3eg0NsB/IrmqKIrV9Q=='
  var rsaAesIv = 'VkH+lhtE7jGkV5rUPM64aQ=='
  var codec = '96 L16/44100/2'
  var announceContent = 'v=0\r\no=AirTunes 7709564614789383330 0 IN IP4 172.17.104.138\r\ns=AirTunes\r\n' +
    'i=Airply Chromecast\r\nc=IN IP4 172.17.104.138\r\nt=0 0\r\nm=audio 0 RTP/AVP 96\r\na=rtpmap:' + codec + '\r\n' +
    'a=rsaaeskey:' + rsaAesKey + '\r\na=aesiv:' + rsaAesIv + '\r\na=min-latency:11025\r\na=max-latency:88200'
  var content = ('ANNOUNCE * RTSP/1.0\r\nCSeq: 0\r\nUser-Agent: AirPlay/190.9\r\nContent-Length: ' + announceContent.length + '\r\n\r\n' + announceContent)
  return content
}
rtpmethods.setParameter = function (type) {
  var content
  if (type === 'volumeChange') {
    // TODO: implement volumeChange response.
  } else { // metadataChange
    var name = daap.encode('minm', 'Track Name')
    var artist = daap.encode('asar', 'Artist')
    var album = daap.encode('asal', 'Album Name')
    var daapContent = daap.encodeList('mlit', name, artist, album)
    content = ('SET_PARAMETER * RTSP/1.0\r\nCSeq: 2\r\nUser-Agent: AirPlay/190.9\r\nContent-Type: application/x-dmap-tagged\r\nContent-Length: ' + daapContent.length + '\r\n\r\n' + daapContent)
  }
  return content
}

module.exports.rtpmethods = rtpmethods

function MockChromecast () {
}

MockChromecast.prototype.start = function () {
  var server = new Chromeserver({
    cert: fs.readFileSync(path.join(__dirname, 'fixtures', 'server-cert.pem')),
    key: fs.readFileSync(path.join(__dirname, 'fixtures', 'server-key.pem')),
    host: '127.0.0.1'
  })
  server.listen(8009)
  server.on('message', function (id, sourceId, destId, namespace, data) {
    var json = {}
    if (typeof data === 'string') {
      json = JSON.parse(data)
    }
    if (json.type === 'PING') {
      server.send(id, destId, sourceId, namespace, JSON.stringify({
        type: 'PONG'
      }))
    }
    if (json.type === 'SET_VOLUME') {
      server.send(id, destId, sourceId, namespace, JSON.stringify({
        requestId: json.requestId,
        status: {
          applications: [
            {
              'appId': 'CC1AD845',
              'displayName': 'Default Media Receiver',
              'namespaces': [
                'urn:x-cast:com.google.cast.player.message',
                'urn:x-cast:com.google.cast.media'
              ],
              'sessionId': '5E2A9CCB-A70B-41FE-9202-B97D10D44889',
              'statusText': 'Ready To Cast',
              'transportId': 'web-3'
            }
          ],
          volume: {
            level: 1.0,
            muted: false
          }
        }
      }))
    }
    if (json.type === 'EDIT_TRACKS_INFO') {
      server.send(id, destId, sourceId, namespace, JSON.stringify({
        requestId: json.requestId,
        type: 'RECEIVER_STATUS',
        status: {
          applications: [
            {
              'appId': 'CC1AD845',
              'displayName': 'Default Media Receiver',
              'namespaces': [
                'urn:x-cast:com.google.cast.player.message',
                'urn:x-cast:com.google.cast.media'
              ],
              'sessionId': '5E2A9CCB-A70B-41FE-9202-B97D10D44889',
              'statusText': 'Ready To Cast',
              'transportId': 'web-3'
            }
          ],
          volume: {
            level: 1.0,
            muted: false
          }
        }
      }))
    }
    if (json.type === 'LAUNCH') {
      server.send(id, destId, sourceId, namespace, JSON.stringify({
        requestId: json.requestId,
        type: 'RECEIVER_STATUS',
        status: {
          applications: [
            {
              'appId': 'CC1AD845',
              'displayName': 'Default Media Receiver',
              'namespaces': [
                'urn:x-cast:com.google.cast.player.message',
                'urn:x-cast:com.google.cast.media'
              ],
              'sessionId': '5E2A9CCB-A70B-41FE-9202-B97D10D44889',
              'statusText': 'Ready To Cast',
              'transportId': 'web-3'
            }
          ],
          volume: {
            level: 1.0,
            muted: false
          }
        }
      }))
    }
  })
}

module.exports.MockChromecast = MockChromecast
