/* eslint-env node */
'use strict'

var exec = require('child_process').exec
var Promise = require('rsvp').Promise
var path = require('path')

/**
* @class
* @name itunes
* @desc Using Javascript OSX ActionScript to request the status of iTunes
* @returns promise
*/
function iTunes () {
  this.scriptDir = path.join(__dirname, '..', 'scripts')
}

/**
* @function
* @name state
* @desc Using Javascript OSX ActionScript, requests the status of iTunes along with the currentTrack data.
* @returns promise
*/
iTunes.prototype.state = function () {
  return new Promise(function (resolve, reject) {
    exec('./connect.js', {
      cwd: this.scriptDir
    }, function (err, stdout, stderr) {
      if (err) {
        reject(err)
      }

      resolve(JSON.parse(stdout))
    })
  }.bind(this))
}

/**
* @function
* @name getArtwork
* @desc Using ActionScript, requests the currentTrack artwork, returing a file location.
* @returns promise
*/
iTunes.prototype.getArtwork = function (callback) {
  return new Promise(function (resolve, reject) {
    exec('osascript save_artwork.scpt', {
      cwd: this.scriptDir
    }, function (err, stdout) {
      if (err) {
        reject(err)
      }
      resolve(stdout.replace(/(\r|\n)/g, ''))
    })
  }.bind(this))
}

module.exports = iTunes
