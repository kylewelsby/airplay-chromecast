#!/usr/bin/env osascript -l JavaScript
/*globals Application*/

function main() {
  "use strict";
  var data = {};
  var itunes = new Application("iTunes");
  var app = Application.currentApplication();
  app.includeStandardAdditions = true;
  data = JSON.parse(JSON.stringify(itunes.properties()));
  data.currentTrack = JSON.parse(JSON.stringify(itunes.currentTrack.properties()));
  data.currentTrack.location = itunes.currentTrack.location().toString();
  var artwork = app.doShellScript("osascript save_artwork.scpt");
  data.currentTrack.artwork = artwork;
  return JSON.stringify(data, null, 2);
}
main();


/** Useful links
http://qiita.com/zakuroishikuro/items/a7def965f49a2ab55be4
*/
