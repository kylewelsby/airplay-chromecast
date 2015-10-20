/* eslint-env node */
'use strict'

var Client = require('castv2-client').Client
var fs = require('fs')
var path = require('path')
var DefaultMediaReceiver = require('castv2-client').DefaultMediaReceiver
var utils = require('./utils')
var debug = require('debug')('airplay-chromecast:chromecast')
var Promise = require('rsvp').Promise

function Chromecast (config) {
  this.client = new Client()
  this.player = null
  this.host = config.host
  this.status = {}
  this.mediaInfo = {};
  var artworkPath = path.join(__dirname, '..', 'assets', 'album-art-missing.jpg')
  fs.readFile(artworkPath, function (err, data) {
    if (!err) {
      this.artwork = 'data:image/jpeg;base64,' + new Buffer(data).toString('base64')
    }
  }.bind(this))
  return this
}

Chromecast.prototype.start = function () {
  return new Promise(function (resolve, reject) {
    this.client.connect(this.host, function () {
      this.client.launch(DefaultMediaReceiver, function (err, player) {
        if (err) {
          throw err;
        }
        debug('Launched Player')
        this.player = player
        player.on('status', function (status) {
          debug('Status', status)
          this.status = status
        }.bind(this))
        resolve(player)
      }.bind(this))
    }.bind(this))
  }.bind(this))
}

Chromecast.prototype.load = function(){
  return new Promise(function(resolve, reject) {
    this.player.load(this.mediaInfo, {autoplay: true}, function (err, status) {
      if (err) {
        reject(err)
      }
      debug("Loaded", status)
      resolve(status)
    }.bind(this))
  }.bind(this));
}

Chromecast.prototype.setStream = function (config) {
  if (!config.contentType) {
    config.contentType = 'audio/mpeg3'
  }
  this.mediaInfo = {
    contentId: config.streamURI,
    contentType: config.contentType,
    streamType: 'LIVE',
    metadata: {
      matadataType: 0,
      title: "AirPlay",
      subtitle: "",
      images: [
        {
          url: this.artwork
        }
      ]
    }
    // metadata: this.currentMetadata
  }
  debug('Loading', this.mediaInfo)
  return this.load();
}

Chromecast.prototype.setVolume = function (volumeSetting) {
  return new Promise(function (resolve, reject) {
    debug('set volume', volumeSetting)
    this.client.setVolume(volumeSetting, function (err) {
      if (err) {
        reject(err)
      }
      resolve()
    })
  }.bind(this))
}

Chromecast.prototype.setMetadata = function (metadata) {
  debug("set metadata", metadata)
  this.mediaInfo.metadata = metadata;
//  return this.load();
}

module.exports = Chromecast
