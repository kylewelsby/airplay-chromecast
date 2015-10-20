/* eslint-env mocha, node */
var assert = require('chai').assert
var mdns = require('mdns')
var net = require('net')

var helper = require('./_helper')

require('../lib/index')

describe('AirPlay Chromecast', function () {
  'use strict'
  this.timeout(5000)

  it('it advertises Chromecast as AirPlay derice', function (done) {
    var browser = mdns.createBrowser(mdns.tcp('_raop'))

    browser.on('serviceUp', function (service) {
      if (/@Test-1$/.test(service.name)) {
        assert.match(service.name, /@Test-1$/, 'includes service name')
        done()
      }
    })
    browser.start()

    var client = mdns.createAdvertisement(mdns.tcp('googlecast'), 9876, {
      name: 'Test-1'
    })
    client.start()
  })

  function updateDetail (port) {
    var client = new net.Socket().connect({ port: port }, function () {
      client.write(helper.rtpmethods.setParameter('metadataChange'))
    })
  }

  function connectClient (port) {
    var client = new net.Socket().connect({ port: port }, function () {
      client.write(helper.rtpmethods.announce())
    })
  }

  describe('onPlay', function () {
    it('updates metadata', function (done) {
      net.createServer(function (socket) {}).listen(8009)
      var browser = mdns.createBrowser(mdns.tcp('_raop'))
      browser.on('serviceUp', function (service) {
        if (/@Test-1$/.test(service.name)) {
          connectClient(service.port)
          setTimeout(function () {
            updateDetail(service.port)
          }, 100)
        }
      })
      browser.start()

      var cast = mdns.createAdvertisement(mdns.tcp('googlecast'), 9876, {
        name: 'Test-1'
      })
      cast.start(function () {
        new net.Socket().connect({ port: 9876 }, function () {})
      })
    })
  })
})
