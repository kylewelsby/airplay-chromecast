/* eslint-env node */
"use strict";

var exec = require("child_process").exec;
var RSVP = require("rsvp");
var path = require("path");

var utils = {};

/**
* @function
* @name itunes
* @desc Using Javascript OSX ActionScript to request the status of iTunes
* @returns promise
*/
utils.itunes = function itunes(){
  return new RSVP.Promise(function(resolve, reject){
    exec("./connect.js", {
      cwd: path.join(__dirname, "..", "scripts")
    }, function(err, stdout, stderr){
      if(err){
        reject(err, stderr);
      }

      resolve(JSON.parse(stdout));
    });

  });
};

module.exports = utils;
