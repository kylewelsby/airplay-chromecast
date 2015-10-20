'use strict'
var RSVP = require('rsvp')
// var debug = require('debug')('airplay-chromecast:utils')

function promiseWhen(condition, timeout){
  if(!timeout){
    timeout = 2000;
  }
  var done = RSVP.defer();
  setTimeout(function(){
    done.reject();
  }, timeout);
  function loop(){
    if(condition()){
      return done.resolve();
    }
    setTimeout(loop,0);
  }
  setTimeout(loop,0);

  return done.promise;
}

var utils = {
  promiseWhen: promiseWhen
}

module.exports = utils
