/* eslint-env node */
'use strict'

var mdns = require('mdns')
var AirPlay = require('./airplay')
var debug = require('debug')('airplay-chromecast')

var browser = mdns.createBrowser(mdns.tcp('googlecast'))

browser.on('serviceUp', function (service) {
  debug('found device "%s" at %s:%d', service.name, service.addresses[0], service.port)
  var airplay = new AirPlay()
  airplay.announce(service)
})

browser.start()
