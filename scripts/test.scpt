JsOsaDAS1.001.00bplist00�Vscript_rvar app = Application.currentApplication();
app.includeStandardAdditions = true;

var itunes = new Application("iTunes");
var loc = itunes.currentTrack.location().toString();
var databaseID = itunes.currentTrack.properties().databaseID;
var art = itunes.currentTrack.artworks();
var artwork = app.doShellScript("osascript save_artwork.scpt");

[loc,art.length, artwork];                              �jscr  ��ޭ