var assert = require('chai').assert
var path = require('path')
var net = require('net')
var helper = require('./_helper')
var AirPlay = require('./../lib/airplay')

describe('AirPlay', function () {
  'use strict'
  describe('new Airplay()', function () {
    it('defines default artwork path', function () {
      assert.equal(new AirPlay().artworkPath, path.join(__dirname, '..', 'assets', 'album-art-missing.jpg'), 'album-art-missing.jpg')
    })
  })

  describe('#announce', function () {
    it("listens to 'clientConnected'", function (done) {
      this.timeout(5000)

      net.createServer(function (socket) {}).listen(8009)

      var client = new net.Socket()
      var airplay = new AirPlay()

      airplay.announce({
        name: 'Test-1',
        addresses: [
          '0.0.0.0'
        ]
      }).then(function () {
        airplay.server.on('clientConnected', function () {
          setTimeout(function () {
            assert.match(airplay.streamURI, /http:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{2,6}\/stream.mp3/)
            done()
          }, 10)
        })
        client.connect({ port: airplay.port }, function () {
          client.write(helper.rtpmethods.announce())
        })
      }).catch(done)
    })

    it("listens to 'metadataChange'", function (done) {
      var client = new net.Socket()
      var airplay = new AirPlay()
      airplay.getArtwork = function () { // stub artwork
        return {
          then: function(callback){
            return callback("/tmp/image.jpg")
          }
        }
      }
      airplay.chromecast = {
        setMetadata: function (data) {
          assert.equal(data.title, 'Track Name', 'track name')
          assert.equal(data.artist, 'Artist', 'track artist')
          assert.equal(data.albumName, 'Album Name', 'track album name')
          assert.match(data.images[0].url, /^data:image\/jpeg;base64,/, 'base64 image')
          done()
        }
      }

      airplay.announce({
        name: 'Test-1'
      }).then(function () {
        client.connect({ port: airplay.port }, function () {
          client.write(helper.rtpmethods.setParameter('metadataChange'))
        })
      }).catch(function (err) {
        done(err)
      })
    })
  })
})
