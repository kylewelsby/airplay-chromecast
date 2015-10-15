/* eslint-env node */
"use strict";

var utils = require("./utils");
var ip = require("ip");
var fs = require("fs");
var path = require("path");
var AirTunesServer = require("nodetunes");
var Client = require("castv2-client").Client;
var DefaultMediaReceiver = require("castv2-client").DefaultMediaReceiver;
var mdns = require("mdns");
var express = require("express");

// var Speaker = require("speaker");
var Lame = require("lame");

// var speaker = new Speaker({
//   channels: 2,
//   bitDepth: 16,
//   sampleRate: 44100
// });

var encoder = new Lame.Encoder({
  channels: 2,
  bitDepth: 16,
  sampleRate: 44100,
  bitRate: 192,
  outSampleRate: 44100,
  mode: Lame.STEREO
});

var app = express();
var artworkPath = path.join(__dirname, "..", "assets", "album-art-missing.jpg");
app.get("/artwork.jpg", function(req, res) {
  fs.createReadStream(artworkPath).pipe(res);
});
app.get("/stream.mp3", function(req, res) {
  res.set({
    "Content-Type": "audio/mpeg3",
    "Transfer-Encoding": "chunked"
  });
  encoder.pipe(res);
});
app.listen(8080);
var streamURI = "http://" + ip.address() + ":8080/stream.mp3";
var artworkURI = "http://" + ip.address() + ":8080/artwork.jpg";
console.log("Streaming at", streamURI);


function formatMetadata(itunesData) {
  artworkPath = itunesData.currentTrack.artwork;
  return {
    albumArtist: itunesData.currentTrack.albumArtist,
    albumName: itunesData.currentTrack.album,
    artist: itunesData.currentTrack.artist,
    composer: itunesData.currentTrack.composer,
    discNumber: itunesData.currentTrack.discNumber,
    trackNumber: itunesData.currentTrack.trackNumber,
    title: itunesData.currentTrack.name,
    releaseDate: itunesData.currentTrack.releaseDate,
    images: [{
      url: artworkURI
    }],
    metadataType: 3
  };
}

function updatePlayer(player) {
  console.log("updating Track info");
  utils.itunes().then(function(itunesData) {

    player.sessionRequest({
      type: "EDIT_TRACKS_INFO",
      metadata: formatMetadata(itunesData)
    });

    setTimeout(function() {
      updatePlayer(player);
    }, 2000);
  });
}

function connectToClient(host) {
  var client = new Client();
  client.connect(host, function() {
    console.log("Connected, launching app....");
    utils.itunes().then(function(itunesData) {
      client.launch(DefaultMediaReceiver, function(err, player) {
        var media = {
          contentId: streamURI,
          contentType: "audio/mpeg3",
          streamType: "LIVE",
          duration: null,
          metadata: formatMetadata(itunesData)
        };

        player.on("status", function(status) {
          console.log("status broadcast playerState=%s", status.playerState);
        });

        console.log("app \"%s\" launched, loading media %s ...", player.session.displayName, media.contentId);

        player.load(media, {
          autoplay: true
        }, function(err, status) {
          console.log("media loaded playerState=%s", status.playerState);
        });

        updatePlayer(player);

      });
    });
  });

  client.on("error", function(err) {
    console.log("Error: %s", err.message);
    client.close();
  });


  return client;
}



var browser = mdns.createBrowser(mdns.tcp("googlecast"));

browser.on("serviceUp", function(service) {
  console.log("found device \"%s\" at %s:%d", service.name, service.addresses[0], service.port);

  var server = new AirTunesServer({
    serverName: service.name
  });
  var client = null;
  server.on("clientConnected", function(stream) {
    console.log("client connected");
    stream.pipe(encoder);
    client = connectToClient(service.addresses[0]);
  });
  server.on("clientDisconnected", function() {
    console.log("client disconnected");
    client.close();
  });
  server.start();
  browser.stop();
});

browser.start();
