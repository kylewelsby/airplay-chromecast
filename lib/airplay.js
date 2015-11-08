/* eslint-env node */
'use strict'

var AirTunesServer = require('nodetunes')
var Lame = require('lame')
var express = require('express')
var fs = require('fs')
var path = require('path')
var ip = require('ip')
var portastic = require('portastic')
var debug = require('debug')('airplay-chromecast:airplay')

var utils = require('./utils')
var Chromecast = require('./chromecast')
var Itunes = require('./itunes')

function AirPlay () {
  this.port = -1
  this.artworkURI = ''
  this.iTunes = new Itunes()
  this.chromecast = null
  this.currentMetadata = {}
  this.artworkPath = path.join(__dirname, '..', 'assets', 'album-art-missing.jpg')
  fs.readFile(this.artworkPath, function (err, data) {
    if (!err) {
      this.artworkURI = 'data:image/jpeg;base64,' + new Buffer(data).toString('base64')
    }
  }.bind(this))
}

AirPlay.prototype.start = function (stream) {
  return new Promise(function (resolve, reject) {
    portastic.find({
      min: 9800,
      max: 9890,
      retrieve: 1
    }).then(function (port) {
      port = port[0]
      var encoder = new Lame.Encoder({
        channels: 2,
        bitDepth: 16,
        sampleRate: 44100,
        bitRate: 192,
        outSampleRate: 44100,
        mode: Lame.STEREO
      })

      stream.pipe(encoder)

      var app = express()
      app.get('/artwork.jpg', function (req, res) {
        fs.createReadStream(this.artworkPath).pipe(res)
      }.bind(this))
      app.get('/stream.mp3', function (req, res) {
        res.set({
          'Content-Type': 'audio/mpeg3',
          'Transfer-Encoding': 'chunked'
        })
        encoder.pipe(res)
      })
      app.listen(port)
      this.streamURI = 'http://' + ip.address() + ':' + port + '/stream.mp3'
      this.artworkURI = 'http://' + ip.address() + ':' + port + '/artwork.jpg'
      resolve({
        streamURI: this.streamURI,
        artworkURI: this.artworkURI
      })
    }.bind(this))
  }.bind(this))
}

AirPlay.prototype.getArtwork = function () {
  return this.iTunes.getArtwork().then(function (artworkPath) {
    this.artworkPath = artworkPath
    return artworkPath
  }.bind(this))
}

AirPlay.prototype.announce = function (service) {
  return new Promise(function (resolve, reject) {
    this.server = new AirTunesServer({
      serverName: service.name
    })

    this.server.on('clientConnected', function (stream) {
      debug('clientConnected')
      this.start(stream)
      this.chromecast = new Chromecast({
        host: service.addresses.sort()[0]
      })
      this.chromecast.start().then(function () {
        debug('Chromecast started')
        return this.chromecast.setStream({
          contentType: 'audio/mpeg3',
          streamURI: this.streamURI
        })
      }.bind(this))
    }.bind(this))

    this.server.on('clientDisconnected', function () {
      if (this.chromecast) {
        this.chromecast.close()
      }
    })
    //
    // this.server.on("artworkChange", function(artwork) {
    //   debug("artworkChange", artwork)
    // })
    //
    this.server.on('volumeChange', function (volume) {
      debug('volumeChange', volume)
      return utils.promiseWhen(function () {
        return this.chromecast !== null
      }.bind(this)).then(function () {
        this.chromecast.setVolume({
          volume: (Math.abs(volume) * 100) / 144 / 100
        })
      }.bind(this))
    })

    this.server.on('metadataChange', function (metadata) {
      debug('metadataChange', metadata)
      this.getArtwork().then(function (path) {
        debug('artwork collected', path)
        this.currentMetadata = {
          albumName: metadata.asal,
          artist: metadata.asar,
          trackNumber: metadata.astn,
          discNumber: metadata.asdk,
          title: metadata.minm,
          images: [{
            url: this.artworkURI
          }],
          metadataType: 3
        }

        return utils.promiseWhen(function () {
          return this.chromecast !== null
        }.bind(this)).then(function () {
          return this.chromecast.setMetadata(this.currentMetadata)
        }.bind(this))
      }.bind(this))
    }.bind(this))

    this.server.start(function (err, server) {
      if (err) {
        reject(err)
      }
      this.port = server.port
      debug('Started AirPlay server: %s on port %s', service.name, server.port)
      resolve(server)
    }.bind(this))
  }.bind(this))
}

module.exports = AirPlay
