// var assert = require('chai').assert
var helper = require('./_helper')
var Chromecast = require('./../lib/chromecast')

describe('Chromecast', function () {
  'use strict'
  describe('new Chromecast()', function () {
    xit('launches with default media receiver', function () {
      // TODO
    })
  })

  describe('.setVolume', function () {
    beforeEach(function () {
      var mock = new helper.MockChromecast()
      mock.start()
    })
    it("set's the volume", function (done) {
      var cast = new Chromecast({
        host: '127.0.0.1'
      })

      cast.start().then(function () {
        return cast.setVolume({
          volume: 0.5
        }).then(function () {
          done()
        })
      }).catch(done)
    })
  })

  describe('.setMetadata', function () {
    it('publishes metadata', function (done) {
      var cast = new Chromecast({
        host: '127.0.0.1'
      })

      cast.start().then(function () {
        return cast.setMetadata({
          title: 'hello world',
          metadataType: 3
        }).then(function () {
          done()
        })
      }).catch(done)
    })
  })
})
